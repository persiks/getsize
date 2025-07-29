document.addEventListener('DOMContentLoaded', () => {
    const overlay = document.getElementById('overlay');
    const diamTxt = document.getElementById('diam');

    let posX = 0,
        posY = 0,
        scale = 1;
    let startX, startY, startDist, initScale;
    let isDragging = false,
        isScaling = false;
    const pointers = {};

    const pxPerMm = (window.devicePixelRatio * 96) / 25.4;

    function updateTransform() {
        overlay.style.transform = `translate(-50%,-50%) translate(${posX}px,${posY}px) scale(${scale})`;
    }

    function updateMeasurement() {
        const rect = overlay.getBoundingClientRect();
        const diamMm = rect.width / pxPerMm;
        diamTxt.textContent = diamMm.toFixed(1);
    }

    updateTransform();
    updateMeasurement();

    overlay.addEventListener('pointerdown', (e) => {
        overlay.setPointerCapture(e.pointerId);
        pointers[e.pointerId] = { x: e.clientX, y: e.clientY };

        if (Object.keys(pointers).length === 1) {
            isDragging = true;
            startX = e.clientX - posX;
            startY = e.clientY - posY;
        } else if (Object.keys(pointers).length === 2) {
            isScaling = true;
            const [p1, p2] = Object.values(pointers);
            startDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            initScale = scale;
        }
    });

    overlay.addEventListener('pointermove', (e) => {
        if (!pointers[e.pointerId]) return;
        pointers[e.pointerId].x = e.clientX;
        pointers[e.pointerId].y = e.clientY;

        if (isScaling && Object.keys(pointers).length >= 2) {
            const [p1, p2] = Object.values(pointers);
            const curDist = Math.hypot(p2.x - p1.x, p2.y - p1.y);
            scale = initScale * (curDist / startDist);
        } else if (isDragging && Object.keys(pointers).length === 1) {
            posX = e.clientX - startX;
            posY = e.clientY - startY;
        }
        updateTransform();
        updateMeasurement();
    });

    overlay.addEventListener('pointerup', (e) => {
        overlay.releasePointerCapture(e.pointerId);
        delete pointers[e.pointerId];
        if (Object.keys(pointers).length < 2) isScaling = false;
        if (Object.keys(pointers).length === 0) isDragging = false;
    });

    overlay.addEventListener('wheel', (e) => {
        e.preventDefault();
        scale *= 1 - e.deltaY * 0.001;
        updateTransform();
        updateMeasurement();
    });
});
