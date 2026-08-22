const canvas_carro = document.getElementById("glCanvasCarro");
const gl_carro = canvas_carro.getContext("webgl2");

if (!gl_carro) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

let vertices_carro = [];

function rectangleVertices_carro(x, y, largura, altura) {
    return new Float32Array([
        x, y + altura,
        x + largura, y + altura,
        x + largura, y,
        x, y,
        x + largura, y,
        x, y + altura
    ]);
}

function circleVertices_carro(cx, cy, radius, numSides) {
    const vertices = [];

    // Center point of the circle
    vertices.push(cx, cy);

    for (let i = 0; i <= numSides; i++) {
        const angle = i * 2 * Math.PI / numSides;
        const x = cx + radius * Math.cos(angle);
        const y = cy + radius * Math.sin(angle);
        vertices.push(x, y);
    }

    return new Float32Array(vertices);
}


// --------------------------------------------------
// COLORS
// --------------------------------------------------

let colors_carro = [];

function solidColor_carro(r, g, b, quantidade) {
    let colorValues = [];
    for (let i = 0; i < quantidade; i++) {
        colorValues.push(r, g, b);
    }
    return new Float32Array(colorValues);
}


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_carro = gl_carro.createBuffer();

const colorsBuffer_carro = gl_carro.createBuffer();

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    new Float32Array(colors_carro),
    gl_carro.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_carro = `#version 300 es

in vec2 aPosition;
in vec3 aColors;

out vec3 vColors;

void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
    vColors = aColors;
}

`;


// --------------------------------------------------
// 4. FRAGMENT SHADER
// --------------------------------------------------

const fragmentShaderSource_carro = `#version 300 es

precision mediump float;

in vec3 vColors;

out vec4 outColor;

void main() {
    outColor = vec4(vColors, 1.0);
}

`;


// --------------------------------------------------
// 5. COMPILAR SHADERS
// --------------------------------------------------

function createShader(gl, type, source) {

    const shader = gl.createShader(type);

    gl.shaderSource(shader, source);

    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

        const error = gl.getShaderInfoLog(shader);

        gl.deleteShader(shader);

        throw new Error(error);
    }

    return shader;
}


const vertexShader_carro = createShader(
    gl_carro,
    gl_carro.VERTEX_SHADER,
    vertexShaderSource_carro
);

const fragmentShader_carro = createShader(
    gl_carro,
    gl_carro.FRAGMENT_SHADER,
    fragmentShaderSource_carro
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_carro = gl_carro.createProgram();

gl_carro.attachShader(program_carro, vertexShader_carro);
gl_carro.attachShader(program_carro, fragmentShader_carro);

gl_carro.linkProgram(program_carro);

if (!gl_carro.getProgramParameter(program_carro, gl_carro.LINK_STATUS)) {

    throw new Error(
        gl_carro.getProgramInfoLog(program_carro)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_carro =
    gl_carro.getAttribLocation(
        program_carro,
        "aPosition"
    );

const colorsLocation_carro =
    gl_carro.getAttribLocation(
        program_carro,
        "aColors"
    );

// --------------------------------------------------
// 8. LIMPAR TELA
// --------------------------------------------------

gl_carro.clearColor(0.1, 0.1, 0.1, 1.0);

gl_carro.clear(gl_carro.COLOR_BUFFER_BIT);

// --------------------------------------------------
// 9. CONFIGURAR ATRIBUTOS (CORPO)
// --------------------------------------------------

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

vertices_carro = rectangleVertices_carro(-0.6, -0.1, 1.2, 0.3);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    vertices_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(positionLocation_carro);

gl_carro.vertexAttribPointer(
    positionLocation_carro,
    2,
    gl_carro.FLOAT,
    false,
    0,
    0
);

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

colors_carro = solidColor_carro(0.8, 0.1, 0.1, 6); // Vermelho

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    colors_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(colorsLocation_carro);

gl_carro.vertexAttribPointer(
    colorsLocation_carro,
    3,
    gl_carro.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 10. DESENHAR (CORPO)
// --------------------------------------------------

gl_carro.useProgram(program_carro);

gl_carro.drawArrays(
    gl_carro.TRIANGLES,
    0,
    6
);

// --------------------------------------------------
// 11. CONFIGURAR ATRIBUTOS (CABINE)
// --------------------------------------------------

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

vertices_carro = rectangleVertices_carro(-0.25, 0.2, 0.55, 0.25);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    vertices_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(positionLocation_carro);

gl_carro.vertexAttribPointer(
    positionLocation_carro,
    2,
    gl_carro.FLOAT,
    false,
    0,
    0
);

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

colors_carro = solidColor_carro(0.4, 0.7, 0.9, 6); // Azul claro

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    colors_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(colorsLocation_carro);

gl_carro.vertexAttribPointer(
    colorsLocation_carro,
    3,
    gl_carro.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 12. DESENHAR (CABINE)
// --------------------------------------------------

gl_carro.useProgram(program_carro);

gl_carro.drawArrays(
    gl_carro.TRIANGLES,
    0,
    6
);

// --------------------------------------------------
// 13. CONFIGURAR ATRIBUTOS (RODA ESQUERDA)
// --------------------------------------------------

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

vertices_carro = circleVertices_carro(-0.35, -0.25, 0.15, 30);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    vertices_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(positionLocation_carro);

gl_carro.vertexAttribPointer(
    positionLocation_carro,
    2,
    gl_carro.FLOAT,
    false,
    0,
    0
);

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

colors_carro = solidColor_carro(0.05, 0.05, 0.05, 32); // Preto

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    colors_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(colorsLocation_carro);

gl_carro.vertexAttribPointer(
    colorsLocation_carro,
    3,
    gl_carro.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 14. DESENHAR (RODA ESQUERDA)
// --------------------------------------------------

gl_carro.useProgram(program_carro);

gl_carro.drawArrays(
    gl_carro.TRIANGLE_FAN,
    0,
    32
);

// --------------------------------------------------
// 15. CONFIGURAR ATRIBUTOS (RODA DIREITA)
// --------------------------------------------------

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, verticesBuffer_carro);

vertices_carro = circleVertices_carro(0.35, -0.25, 0.15, 30);

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    vertices_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(positionLocation_carro);

gl_carro.vertexAttribPointer(
    positionLocation_carro,
    2,
    gl_carro.FLOAT,
    false,
    0,
    0
);

gl_carro.bindBuffer(gl_carro.ARRAY_BUFFER, colorsBuffer_carro);

colors_carro = solidColor_carro(0.05, 0.05, 0.05, 32); // Preto

gl_carro.bufferData(
    gl_carro.ARRAY_BUFFER,
    colors_carro,
    gl_carro.STATIC_DRAW
);

gl_carro.enableVertexAttribArray(colorsLocation_carro);

gl_carro.vertexAttribPointer(
    colorsLocation_carro,
    3,
    gl_carro.FLOAT,
    false,
    0,
    0
);

// --------------------------------------------------
// 16. DESENHAR (RODA DIREITA)
// --------------------------------------------------

gl_carro.useProgram(program_carro);

gl_carro.drawArrays(
    gl_carro.TRIANGLE_FAN,
    0,
    32
);