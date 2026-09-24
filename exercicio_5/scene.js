// ==================================================
// CLASS - SCENE
// ==================================================

class Scene {

    constructor(gl, program) {

        this.renderer =
            new Renderer(gl, program);

        // Partes do helicóptero
        this.helicopterBody = new HelicopterBody();
        this.helicopterTopShaft = new HelicopterTopShaft();
        this.helicopterTail = new HelicopterTail();
        this.helicopterPropellers = new HelicopterPropellers();
        this.helicopterTailPropeller = new HelicopterTailPropeller();

        // Posição do helicóptero
        this.positionX = 0.0;
        this.positionY = 0.0;

        // Velocidade de deslocamento (unidades por segundo)
        this.moveSpeed = 0.8;

        // Ângulos das hélices
        this.topRotorAngle = 0.0;
        this.tailRotorAngle = 0.0;

        // Velocidade angular das hélices (rad/s)
        this.topRotorSpeed = 7.0;
        this.tailRotorSpeed = 10.0;

        // Controle de tempo da animação
        this.lastTime = null;

        // Estado das teclas
        this.keys = {};

        this.setupKeyboard();
    }

    setupKeyboard() {

        window.addEventListener("keydown", (event) => {

            if (
                event.key === "ArrowUp" ||
                event.key === "ArrowDown" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight"
            ) {
                event.preventDefault();
                this.keys[event.key] = true;
            }
        });

        window.addEventListener("keyup", (event) => {

            if (
                event.key === "ArrowUp" ||
                event.key === "ArrowDown" ||
                event.key === "ArrowLeft" ||
                event.key === "ArrowRight"
            ) {
                event.preventDefault();
                this.keys[event.key] = false;
            }
        });

        // Evita que o helicóptero continue se movendo
        // caso a janela perca o foco com uma tecla pressionada.
        window.addEventListener("blur", () => {
            this.keys = {};
        });
    }

    update(deltaTime) {

        // ==================================================
        // MOVIMENTO DO HELICÓPTERO
        // ==================================================

        const distance =
            this.moveSpeed * deltaTime;

        if (this.keys["ArrowLeft"]) {
            this.positionX -= distance;
        }

        if (this.keys["ArrowRight"]) {
            this.positionX += distance;
        }

        if (this.keys["ArrowUp"]) {
            this.positionY += distance;
        }

        if (this.keys["ArrowDown"]) {
            this.positionY -= distance;
        }

        // ==================================================
        // ROTAÇÃO CONTÍNUA DAS HÉLICES
        // ==================================================

        this.topRotorAngle =
            (
                this.topRotorAngle +
                this.topRotorSpeed * deltaTime
            ) % (Math.PI * 2);

        this.tailRotorAngle =
            (
                this.tailRotorAngle +
                this.tailRotorSpeed * deltaTime
            ) % (Math.PI * 2);

        // ==================================================
        // TRANSFORMAÇÃO DO CORPO
        // ==================================================

        const helicopterTranslation =
            m4.translation(
                this.positionX,
                this.positionY,
                0.0
            );

        this.helicopterBody.update(
            helicopterTranslation
        );

        this.helicopterTopShaft.update(
            helicopterTranslation
        );

        this.helicopterTail.update(
            helicopterTranslation
        );

        // ==================================================
        // HÉLICE SUPERIOR
        //
        // A hélice superior está no plano XZ,
        // portanto gira ao redor do eixo Y.
        // Depois da rotação, recebe a mesma translação
        // do restante do helicóptero.
        // ==================================================

        let topRotorTransform =
            m4.yRotation(
                this.topRotorAngle
            );

        topRotorTransform =
            m4.translate(
                topRotorTransform,
                this.positionX,
                this.positionY,
                0.0
            );

        this.helicopterPropellers.update(
            topRotorTransform
        );

        // ==================================================
        // HÉLICE DA CAUDA
        //
        // A hélice da cauda está no plano XY,
        // portanto gira ao redor do eixo Z.
        //
        // Como sua geometria está centrada aproximadamente
        // em (0.70, 0.00, 0.06), fazemos:
        //
        // 1) mover o centro da hélice para a origem;
        // 2) rotacionar em Z;
        // 3) devolver ao ponto original;
        // 4) aplicar a translação do helicóptero.
        // ==================================================

        let tailRotorTransform =
            m4.identity();

        tailRotorTransform =
            m4.translate(
                tailRotorTransform,
                -0.70,
                0.0,
                -0.06
            );

        tailRotorTransform =
            m4.zRotate(
                tailRotorTransform,
                this.tailRotorAngle
            );

        tailRotorTransform =
            m4.translate(
                tailRotorTransform,
                0.70,
                0.0,
                0.06
            );

        tailRotorTransform =
            m4.translate(
                tailRotorTransform,
                this.positionX,
                this.positionY,
                0.0
            );

        this.helicopterTailPropeller.update(
            tailRotorTransform
        );
    }

    draw() {

        gl.clear(
            gl.COLOR_BUFFER_BIT |
            gl.DEPTH_BUFFER_BIT
        );

        gl.useProgram(program);

        this.helicopterBody.draw(
            this.renderer
        );

        this.helicopterTopShaft.draw(
            this.renderer
        );

        this.helicopterTail.draw(
            this.renderer
        );

        this.helicopterPropellers.draw(
            this.renderer
        );

        this.helicopterTailPropeller.draw(
            this.renderer
        );
    }

    execute(time) {

        if (this.lastTime === null) {
            this.lastTime = time;
        }

        let deltaTime =
            (time - this.lastTime) / 1000.0;

        this.lastTime = time;

        // Evita saltos grandes caso a aba fique inativa.
        deltaTime =
            Math.min(deltaTime, 0.05);

        this.update(deltaTime);
        this.draw();

        requestAnimationFrame(
            (nextTime) =>
                this.execute(nextTime)
        );
    }

    init() {

        requestAnimationFrame(
            (time) =>
                this.execute(time)
        );
    }
}
