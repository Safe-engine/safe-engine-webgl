export const tieldFsh = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 v_texCoord;
varying vec4 v_fragmentColor;

uniform sampler2D u_texture;
uniform vec2 u_tileScale;
uniform vec2 u_texSize;

void main()
{
    // scale UV to tile space
    vec2 uv = v_texCoord * u_tileScale;

    // wrap using fract
    vec2 uvw = fract(uv);

    // avoid linear-filter seams: push UVs slightly away from exact 0.0/1.0 edges
    // compute texel size in uv-space
    vec2 texel = 1.0 / u_texSize;

    // shrink usable range slightly to avoid sampling border when linear filter is used
    // the factor 1.0 - 2.0*texel moves the uv into [texel, 1-texel]
    uvw = uvw * (1.0 - 2.0 * texel) + texel;

    vec4 color = texture2D(u_texture, uvw);

    gl_FragColor = color * v_fragmentColor;
}
`
export const tiledVsh = `
attribute vec4 a_position;
attribute vec2 a_texCoord;
attribute vec4 a_color;

#ifdef GL_ES
varying mediump vec2 v_texCoord;
varying lowp vec4 v_fragmentColor;
#else
varying vec2 v_texCoord;
varying vec4 v_fragmentColor;
#endif
uniform vec2 u_scale;
uniform vec2 u_size;

void main() {
    gl_Position = CC_PMatrix * a_position;
    v_texCoord = a_texCoord;
    v_fragmentColor = a_color;
}
`
