
export var gl: WebGL2RenderingContext;

export function setGL(_gl: WebGL2RenderingContext) {
  gl = _gl;

  // Get the maximum number of draw buffers
  //gl.getExtension('OES_texture_float');
  
  gl.getExtension('EXT_color_buffer_float');
  gl.getExtension('OES_texture_float_linear');
  //gl.getExtension('OES_element_index_uint');
  //gl.getExtension('WEBGL_depth_texture');
  
  //export const WEBGL_draw_buffers = gl.getExtension('WEBGL_draw_buffers');
  //export const MAX_DRAW_BUFFERS_WEBGL = gl.getParameter(WEBGL_draw_buffers.MAX_DRAW_BUFFERS_WEBGL);

}

