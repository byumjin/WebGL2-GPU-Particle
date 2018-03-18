#version 300 es
precision highp float;

uniform sampler2D u_prevVelocityTexture;
uniform sampler2D u_prevPositionTexture;

uniform sampler2D u_VelocityPrimeTexture;
uniform sampler2D u_PositionPrimeTexture;



uniform float u_DeltaTime;
uniform vec2 u_BufferSize;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec2 fs_UV;

flat in ivec2 index;

layout(location = 0) out vec4 out_velocity;
layout(location = 1) out vec4 out_position;


void main()
{  
    //runge_kutta_2nd

    //calculate Vel
    vec3 prevVelocity = texture(u_prevVelocityTexture, fs_UV).xyz;
    vec3 velocityPrime = texture(u_VelocityPrimeTexture, fs_UV).xyz;

    vec3 PredictVel = prevVelocity + velocityPrime * u_DeltaTime;
    vec3 PredictVelPrime = (PredictVel - prevVelocity) / u_DeltaTime;

    out_velocity = vec4(prevVelocity + (u_DeltaTime * 0.5) * (velocityPrime + PredictVelPrime), 1.0);


    //calculate Pos
    vec4 prevPosition = texture(u_prevPositionTexture, fs_UV);
    vec3 positionPrime = texture(u_PositionPrimeTexture, fs_UV).xyz;

    vec3 PredictPos = prevPosition.xyz + positionPrime * u_DeltaTime;
    vec3 PredictPosPrime = (PredictPos - prevPosition.xyz) / u_DeltaTime;

    out_position = vec4(prevPosition.xyz + (u_DeltaTime * 0.5) * (positionPrime + PredictPosPrime), prevPosition.w);


}
