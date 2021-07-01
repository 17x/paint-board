const fillEllipse = (ctx, { x, y, radiusX, radiusY, rotation = Math.PI * 2, startAngle = 0, endAngle = Math.PI * 2, counterclockwise = 1 }) => {
    ctx.ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle, counterclockwise);
};

export default ({ type, ctx, fillStyle, param }) => {
    ctx.beginPath();
    ctx.fillStyle = fillStyle;

    if(type === 'circle'){
        fillEllipse(ctx, param);
    }

    ctx.fill();
}