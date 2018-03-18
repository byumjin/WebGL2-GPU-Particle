#version 300 es
precision highp float;


uniform sampler2D u_prevVelocityTexture;
uniform sampler2D u_prevPositionTexture;

uniform sampler2D u_objInfoTexture;

uniform vec2 u_BufferSize;
uniform vec4 u_ClickedPos;
uniform float u_MaxSpeed;

uniform int u_TraceObj;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec2 fs_UV;

layout(location = 0) out vec4 out_velocityPrime;
layout(location = 1) out vec4 out_positionPrime;

layout(location = 2) out vec4 out_velocity;
layout(location = 3) out vec4 out_position;

void main()
{    
    vec4 prevPosition = texture(u_prevPositionTexture, fs_UV);
    vec4 prevVelocity = texture(u_prevVelocityTexture, fs_UV);

    vec4 targetPos;
    
    vec4 objInfo = texture(u_objInfoTexture, fs_UV);    

    float isntBG = 1.0;

    if(objInfo.w > 0.0)
    {
        if(u_ClickedPos.w > 0.0 && distance(prevPosition.xyz, u_ClickedPos.xyz) < 30.0)
        {
            targetPos = u_ClickedPos;
        }
        else
            targetPos = objInfo;
    }      
    else
    {
        if(u_ClickedPos.w == 0.0)
        {
            targetPos.w = 0.0;
        }
        else if(distance(prevPosition.xyz, u_ClickedPos.xyz) < 50.0)
        {
            targetPos = u_ClickedPos;
        }   

        isntBG = 0.0;     
    }
     

    //calculate velocityPrime
    
   

    vec3 desiredVelocity;
    
    if(targetPos.w == 1.0)
    {
       desiredVelocity = targetPos.xyz - prevPosition.xyz;

       //if( length(desiredVelocity) > u_MaxSpeed)
           desiredVelocity = normalize(desiredVelocity) * u_MaxSpeed;
    }
    else if(targetPos.w == 2.0)
    {
       desiredVelocity = prevPosition.xyz - targetPos.xyz;
       //if( length(desiredVelocity) > u_MaxSpeed)
           desiredVelocity = normalize(desiredVelocity) * u_MaxSpeed;
    }
    else
    {
        desiredVelocity = fs_Col.xyz - prevPosition.xyz;//  vec3(0.0);
    }
      
    

    vec3 acceleration = (desiredVelocity - prevVelocity.xyz);
    
    out_velocityPrime = vec4(acceleration, 1.0);
    out_positionPrime = prevVelocity;

    out_velocity = prevVelocity;
    out_position = prevPosition;
    out_position.w = isntBG;
    
}
