const btn = document.querySelector('.btn');

btn.addEventListener('mousemove', (e) => {
    const sensitivity = 30;
    const {
        offsetX,
        offsetY
    } = e;
    const {
        offsetHeight,
        offsetWidth
    } = e.target;

    const y = -((offsetX / offsetWidth) - 0.5) * sensitivity;
    const x = ((offsetY / offsetHeight) - 0.5) * sensitivity;

    btn.style.transform = `rotateX(${x}deg) rotateY(${y}deg) rotateZ(0) scale(1.2)`;
});

btn.addEventListener('mouseout', () => {
    btn.style.transform = "scale(1.0) rotateX(0) rotateY(0)";
});