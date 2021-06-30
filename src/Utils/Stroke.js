export default ({ ctx, start, end, strokeWidth = 1, strokeColor = '#000000', antiAliasing = false }) => {
    // anti-aliasing, increase max to repeatedly render
    for(let i = 0; i < 1; i++){
        ctx.beginPath();
        ctx.lineCap = 'round';
        ctx.lineWidth = strokeWidth;
        ctx.strokeStyle = strokeColor;
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
    }
}