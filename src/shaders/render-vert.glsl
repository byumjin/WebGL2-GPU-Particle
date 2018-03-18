#version 300 es

uniform sampler2D u_prevPositionTexture;
uniform sampler2D u_prevVelocityTexture;

uniform mat4 u_Model;
uniform mat4 u_ViewProj;
uniform vec2 u_BufferSize;
uniform mat3 u_CameraAxes;
uniform float u_MaxSpeed;

uniform float u_ParticleSize;
uniform float u_Time;

uniform float u_BackGround;

uniform vec4 u_ParticleColor00;
uniform vec4 u_ParticleColor01;
uniform vec4 u_ParticleColor02;
uniform vec4 u_ParticleColor03;
uniform vec4 u_ParticleColor04;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec2 vs_UV;
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

out vec4 fs_Col;
out vec4 fs_Pos;
out vec2 fs_UV;

void main()
{
    int y = int(gl_InstanceID / int(u_BufferSize.x));
    int x = gl_InstanceID - y * int(u_BufferSize.x);

    ivec2 index = ivec2(x, y);
    vec2 uv = vec2(float(x) / u_BufferSize.x, float(y) / u_BufferSize.y);

    vec4 prevPos = texture(u_prevPositionTexture, uv);
    vec3 offset = prevPos.xyz;

    float colorSpeed = length(texture(u_prevVelocityTexture, uv).xyz) / u_MaxSpeed;
    float colorPin = (sin( (uv.x + uv.y) * 0.5  + u_Time) + 1.0) * 0.5;
    vec4 colorResult;
    
    if(colorPin < 0.2)
       colorResult = mix(u_ParticleColor00, u_ParticleColor01, colorPin / 0.2 );
    else if(colorPin < 0.4)
       colorResult = mix(u_ParticleColor01, u_ParticleColor02, (colorPin-0.2) / 0.2 );
    else if(colorPin < 0.6)
       colorResult = mix(u_ParticleColor02, u_ParticleColor03, (colorPin-0.4) / 0.2 );
    else if(colorPin < 0.8)
       colorResult = mix(u_ParticleColor03, u_ParticleColor04, (colorPin-0.6) / 0.2 );
    else
       colorResult = mix(u_ParticleColor04, u_ParticleColor00, (colorPin-0.8) / 0.2 );

    fs_Col = vec4(colorResult.xyz, colorSpeed);
    
    fs_Pos = vs_Pos * u_ParticleSize;
   
    
    //BG particle
    if(prevPos.w == 0.0)
    {
        fs_Pos *= 3.0;

        //apply env force

        if(u_BackGround < 0.5)
        {

        }
        else if(u_BackGround < 1.5)
        {
            float waveTime = u_Time * 2.6;
            float waveGap = sqrt(offset.x * offset.x + offset.z * offset.z);         
            offset.y = sin(waveGap * 0.3 - waveTime*10.0  ) * sqrt(waveGap*0.5) - 18.0;
            
        }
        else if(u_BackGround < 2.5)
        {
            float stepsTime = u_Time * 2.6;
            float XX = floor(offset.x*0.3);
            float YY = floor(offset.z*0.3);
            offset.y = max(XX * sin(XX + stepsTime), YY * cos(YY +stepsTime)) - 18.0;
        }
        else if(u_BackGround < 3.5)
        {
            //Refer to Nop Jiarathanakul's A Particle Dream
            // cylindrical coords
            float radius = uv.y;
            float theta = uv.x * 6.283185307179586476925286766559 + u_Time;

            // outward spiral function
            radius *= 3.1415926535897932384626433832795;
            vec3 targetPos = vec3(
                radius * sin(theta),
                radius*radius * sin(4.0*theta + sin(3.0*3.1415926535897932384626433832795*radius+u_Time/2.0)) / 10.0,
                radius * cos(theta)
            );
            offset = targetPos * 15.0;
        }
    }
    

    fs_UV.x = prevPos.w;

    offset = vec3(u_Model * vec4(offset, 1.0));
    vec3 billboardPos = offset + fs_Pos.x * u_CameraAxes[0] + fs_Pos.y * u_CameraAxes[1];

    gl_Position = u_ViewProj * vec4(billboardPos, 1.0);
}
