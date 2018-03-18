#version 300 es
precision highp float;

uniform mat4 u_Model;

in vec4 fs_Col;
in vec4 fs_Pos;
in vec2 fs_UV;

layout(location = 0) out vec4 out_Color;


void main()
{  
   if(fs_Col.w > 0.0)
     out_Color = u_Model * fs_Col;
   else
     out_Color = fs_Col;
}
