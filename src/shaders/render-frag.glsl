#version 300 es
precision highp float;

uniform float u_ParticleSize;
uniform float u_ParticleAlpha;
in vec4 fs_Col;
in vec4 fs_Pos;
in vec2 fs_UV;


layout(location = 0) out vec4 out_Color;

void main()
{    
   float dist;
   
   //BG particles     
   if(fs_UV.x == 0.0)
   {
       dist = clamp(1.0 - ( length(fs_Pos.xyz / (u_ParticleSize) )  * 2.0), 0.0, 1.0);
   }
   else
   {
       dist = clamp(1.0 - ( length(fs_Pos.xyz / u_ParticleSize)  * 2.0), 0.0, 1.0);
   }
   
   out_Color = vec4(dist) * fs_Col;
   out_Color.xyz *=  (u_ParticleAlpha + (1.0 - u_ParticleAlpha) * fs_Col.w);
   out_Color.w = 1.0;
}
