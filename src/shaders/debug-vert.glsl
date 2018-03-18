#version 300 es

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec2 vs_UV;
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

out vec2 fs_UV;

void main()
{
    fs_UV = vs_UV;
	gl_Position = vs_Pos;
}
