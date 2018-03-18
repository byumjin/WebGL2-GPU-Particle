#version 300 es

uniform vec2 u_BufferSize;

in vec4 vs_Pos; // Non-instanced; each particle is the same quad drawn in a different place
in vec4 vs_Col; // An instanced rendering attribute; each particle instance has a different color
in vec2 vs_UV;
in vec3 vs_Translate; // Another instance rendering attribute used to position each quad instance in the scene

out vec4 fs_Col;
out vec4 fs_Pos;
out vec2 fs_UV;

void main()
{
    fs_Col = vs_Col;
    fs_Pos = vs_Pos;
    

    vec3 offset = vs_Translate;
    
    vec3 billboardPos = offset + vs_Pos.xyz + vec3(0.5, 0.5, 0.0);

    gl_Position = vec4(billboardPos.x / u_BufferSize.x * 2.0 - 1.0, billboardPos.y / u_BufferSize.y * 2.0 - 1.0, 0.5,1.0);

    int y = int(gl_InstanceID / int(u_BufferSize.x));
    int x = gl_InstanceID - y * int(u_BufferSize.x);

    ivec2 index = ivec2(x, y);
    fs_UV = vec2(float(index.x) / u_BufferSize.x, float(index.y) / u_BufferSize.y);
}
