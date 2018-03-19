#version 300 es
precision highp float;


uniform sampler2D u_prevVelocityTexture;
uniform sampler2D u_prevPositionTexture;

uniform sampler2D u_objInfoTexture;

uniform vec2 u_BufferSize;
uniform vec4 u_ClickedPos;
uniform float u_MaxSpeed;

uniform int u_TraceObj;

uniform float u_BackGround;
uniform float u_Time;

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
    //Background     
    else
    {
        if(u_ClickedPos.w > 0.0 && distance(prevPosition.xyz, u_ClickedPos.xyz) < 50.0)
        {
            targetPos = u_ClickedPos;
        }   
        else
        {
            //targetPos.w = 0.0;

            //apply env force
            vec3 offset = fs_Col.xyz;
            if(u_BackGround < 0.5)
            {

            }
            else if(u_BackGround < 1.5)
            {                
                float waveTime = u_Time * 0.5;
                float waveGap = sqrt(offset.x * offset.x + offset.z * offset.z);         
                offset.y = sin(waveGap * 0.3 - waveTime*10.0  ) * sqrt(waveGap*0.5) - 18.0;
                
            }
            else if(u_BackGround < 2.5)
            {
                float stepsTime = u_Time * 1.6;
                float XX = floor(offset.x*0.3);
                float YY = floor(offset.z*0.3);
                offset.y = max(XX * sin(XX + stepsTime), YY * cos(YY +stepsTime)) - 23.0;
            }
            else if(u_BackGround < 3.5)
            {
                //Refer to Nop Jiarathanakul's A Particle Dream
                // cylindrical coords
                float radius = fract(offset.z);
                float theta = fract(offset.x) * 6.283185307179586476925286766559 + u_Time;

                // outward spiral function
                radius *= 3.1415926535897932384626433832795;
                vec3 spiralPos = vec3(
                    radius * sin(theta),
                    radius*radius * sin(4.0*theta + sin(3.0*3.1415926535897932384626433832795*radius+u_Time/2.0)) / 10.0,
                    radius * cos(theta)
                );
                offset = spiralPos * 200.0;
                offset.y -= 23.0;
            }
            else if(u_BackGround < 4.5)
            {
               float width = pow(abs(offset.x * offset.y * offset.z * 0.000001), 1.0 / (1.5) );
               offset.x *= width;
               offset.z *= width;
            }

            targetPos = vec4(offset, 1.0);
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
        desiredVelocity =  fs_Col.xyz - prevPosition.xyz;//  vec3(0.0);
    }
      
    

    vec3 acceleration = (desiredVelocity - prevVelocity.xyz);
    
    out_velocityPrime = vec4(acceleration, 1.0);
    out_positionPrime = prevVelocity;

    out_velocity = prevVelocity;
    out_position = prevPosition;
    out_position.w = isntBG;
    
}
