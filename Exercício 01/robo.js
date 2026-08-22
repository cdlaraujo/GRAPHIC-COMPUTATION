const canvas_robo = document.getElementById("glCanvasRobo");
const gl_robo = canvas_robo.getContext("webgl2");

if (!gl_robo) {
    throw new Error("WebGL 2 não é suportado.");
}


// --------------------------------------------------
// 1. VERTICES
// --------------------------------------------------

let vertices_robo = [];

function rectangleVertices_robo(x, y, largura, altura) {
    return new Float32Array([
        x, y + altura,
        x + largura, y + altura,
        x + largura, y,
        x, y,
        x + largura, y,
        x, y + altura
    ]);
}

function circleVertices_robo(cx, cy, radius, numSides) {
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

let colors_robo = [];

function solidColor_robo(r, g, b, quantidade) {
    let colorValues = [];
    for (let i = 0; i < quantidade; i++) {
        colorValues.push(r, g, b);
    }
    return new Float32Array(colorValues);
}


// --------------------------------------------------
// 2. BUFFERS
// --------------------------------------------------

const verticesBuffer_robo = gl_robo.createBuffer();

const colorsBuffer_robo = gl_robo.createBuffer();

gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, colorsBuffer_robo);

gl_robo.bufferData(
    gl_robo.ARRAY_BUFFER,
    new Float32Array(colors_robo),
    gl_robo.STATIC_DRAW
);


// --------------------------------------------------
// 3. VERTEX SHADER
// --------------------------------------------------

const vertexShaderSource_robo = `#version 300 es

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

const fragmentShaderSource_robo = `#version 300 es

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


const vertexShader_robo = createShader(
    gl_robo,
    gl_robo.VERTEX_SHADER,
    vertexShaderSource_robo
);

const fragmentShader_robo = createShader(
    gl_robo,
    gl_robo.FRAGMENT_SHADER,
    fragmentShaderSource_robo
);


// --------------------------------------------------
// 6. CRIAR PROGRAMA
// --------------------------------------------------

const program_robo = gl_robo.createProgram();

gl_robo.attachShader(program_robo, vertexShader_robo);
gl_robo.attachShader(program_robo, fragmentShader_robo);

gl_robo.linkProgram(program_robo);

if (!gl_robo.getProgramParameter(program_robo, gl_robo.LINK_STATUS)) {

    throw new Error(
        gl_robo.getProgramInfoLog(program_robo)
    );
}


// --------------------------------------------------
// 7. LOCAL DOS ATRIBUTOS
// --------------------------------------------------

const positionLocation_robo =
    gl_robo.getAttribLocation(
        program_robo,
        "aPosition"
    );

const colorsLocation_robo =
    gl_robo.getAttribLocation(
        program_robo,
        "aColors"
    );

// --------------------------------------------------
// 8. LIMPAR TELA
// --------------------------------------------------

gl_robo.clearColor(0.1, 0.1, 0.1, 1.0);

gl_robo.clear(gl_robo.COLOR_BUFFER_BIT);

// --------------------------------------------------
// FUNÇÃO AUXILIAR: desenhar um retângulo
// --------------------------------------------------

function desenharRetangulo_robo(x, y, largura, altura, r, g, b) {

    gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, verticesBuffer_robo);

    vertices_robo = rectangleVertices_robo(x, y, largura, altura);

    gl_robo.bufferData(
        gl_robo.ARRAY_BUFFER,
        vertices_robo,
        gl_robo.STATIC_DRAW
    );

    gl_robo.enableVertexAttribArray(positionLocation_robo);

    gl_robo.vertexAttribPointer(
        positionLocation_robo,
        2,
        gl_robo.FLOAT,
        false,
        0,
        0
    );

    gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, colorsBuffer_robo);

    colors_robo = solidColor_robo(r, g, b, 6);

    gl_robo.bufferData(
        gl_robo.ARRAY_BUFFER,
        colors_robo,
        gl_robo.STATIC_DRAW
    );

    gl_robo.enableVertexAttribArray(colorsLocation_robo);

    gl_robo.vertexAttribPointer(
        colorsLocation_robo,
        3,
        gl_robo.FLOAT,
        false,
        0,
        0
    );

    gl_robo.useProgram(program_robo);

    gl_robo.drawArrays(
        gl_robo.TRIANGLES,
        0,
        6
    );
}


// --------------------------------------------------
// FUNÇÃO AUXILIAR: desenhar um círculo
// --------------------------------------------------

function desenharCirculo_robo(cx, cy, radius, numSides, r, g, b) {

    gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, verticesBuffer_robo);

    vertices_robo = circleVertices_robo(cx, cy, radius, numSides);

    gl_robo.bufferData(
        gl_robo.ARRAY_BUFFER,
        vertices_robo,
        gl_robo.STATIC_DRAW
    );

    gl_robo.enableVertexAttribArray(positionLocation_robo);

    gl_robo.vertexAttribPointer(
        positionLocation_robo,
        2,
        gl_robo.FLOAT,
        false,
        0,
        0
    );

    const totalPontos = numSides + 2;

    gl_robo.bindBuffer(gl_robo.ARRAY_BUFFER, colorsBuffer_robo);

    colors_robo = solidColor_robo(r, g, b, totalPontos);

    gl_robo.bufferData(
        gl_robo.ARRAY_BUFFER,
        colors_robo,
        gl_robo.STATIC_DRAW
    );

    gl_robo.enableVertexAttribArray(colorsLocation_robo);

    gl_robo.vertexAttribPointer(
        colorsLocation_robo,
        3,
        gl_robo.FLOAT,
        false,
        0,
        0
    );

    gl_robo.useProgram(program_robo);

    gl_robo.drawArrays(
        gl_robo.TRIANGLE_FAN,
        0,
        totalPontos
    );
}


// --------------------------------------------------
// 9. DESENHAR A CABEÇA (CAIXA)
// --------------------------------------------------

desenharRetangulo_robo(-0.4, -0.4, 0.8, 0.8, 0.75, 0.75, 0.75); // Cinza claro


// --------------------------------------------------
// 10. DESENHAR OS OLHOS
// --------------------------------------------------

desenharCirculo_robo(-0.18, 0.15, 0.08, 20, 0.0, 0.0, 0.0); // Olho esquerdo
desenharCirculo_robo( 0.18, 0.15, 0.08, 20, 0.0, 0.0, 0.0); // Olho direito


// --------------------------------------------------
// 11. DESENHAR A BOCA
// --------------------------------------------------

desenharRetangulo_robo(-0.2, -0.2, 0.4, 0.1, 0.0, 0.0, 0.0); // Boca retangular