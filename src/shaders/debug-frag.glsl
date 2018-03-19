#version 300 es
precision highp float;

//uniform sampler2D u_ParticleTexture;
uniform float u_Time;

uniform vec4 u_ParticleColor00;
uniform vec4 u_ParticleColor01;
uniform vec4 u_ParticleColor02;
uniform vec4 u_ParticleColor03;
uniform vec4 u_ParticleColor04;

in vec2 fs_UV;

layout(location = 0) out vec4 out_Color;

void main()
{    
  float x = pow(sqrt(1.0 - abs((fs_UV.x * 2.0 - 1.0))), 3.0);
  float y = pow(fs_UV.y, 16.0);
  y += pow(1.0 - fs_UV.y, 16.0);
  float alpha = x * y * 2.0;

  vec4 colorResult;

  float colorPin = fract(u_Time*0.2);

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

  out_Color = colorResult * alpha * (sin(u_Time*0.4) * 0.2 + 0.8) * 0.4;
  out_Color.w = 1.0;
}
