import { isTouch, eventsName } from '../Utils/Base';
import CoordTransform from '../Utils/CoordTransform';
import Stroke from '../Utils/Stroke';

const Polygon = (() => {
    let canvas = null;
    let ctx = null;

    const Start = function(){
        canvas = this.canvas;
        ctx = this.ctx;

        // define events
        let points = [];
        const disabledSelection = (event) => {
            event.preventDefault();
        };

        const move = (event) => {
            if(points.length > 0){
                let x = isTouch ? event.touches[0].pageX : event.x;
                let y = isTouch ? event.touches[0].pageY : event.y;
                let currCoord = CoordTransform({
                    canvas,
                    event : {
                        x,
                        y
                    }
                });
                let endPoint = points[points.length - 1];

                endPoint.x = currCoord.x;
                endPoint.y = currCoord.y;
                Render();
            }

        };

        const up = (event) => {
            if(points.length === 0){
                return;
            }

            let { x, y } = points[points.length - 1];

            // and set new end
            points.push(
                {
                    x,
                    y
                }
            );
            // console.log(points);

            Render();

            document.removeEventListener('selectstart', disabledSelection);
            document.removeEventListener(eventsName[2], up);
        };

        const Render = () => {
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            let { strokeWidth, strokeColor } = this.strokeConfig;

            for(let i = 0; i < points.length; i++){
                let lastP = null;
                let currP = points[i];

                if(points.length === 0){
                    lastP = currP;
                } else{
                    if(i === 0){
                        lastP = points[points.length - 1];
                    } else{
                        lastP = points[i - 1];
                    }
                }

                Stroke({
                    ctx,
                    start : lastP,
                    end : currP,
                    strokeWidth,
                    strokeColor
                });
            }
        };

        // gesture start
        canvas['on' + eventsName[0]] = (event) => {
            // non-touch device and left click
            // prevent
            if(!isTouch && event.buttons !== 1){
                return;
            }

            let x = isTouch ? event.touches[0].pageX : event.x;
            let y = isTouch ? event.touches[0].pageY : event.y;

            let currCoord = CoordTransform({
                canvas,
                event : {
                    x,
                    y
                }
            });
            if(points.length === 0){
                // start and end
                points.push(
                    {
                        ...currCoord
                    }, {
                        ...currCoord
                    }
                );
            }

            document.addEventListener('selectstart', disabledSelection);
            document.addEventListener(eventsName[2], up);
        };

        canvas.oncontextmenu = (event) => {
            event.preventDefault();
            points.length -= 1;
            Render();

            if(!isTouch){
                document.removeEventListener(eventsName[1], move);
            }
            canvas.oncontextmenu = null;
            canvas['on' + eventsName[0]] = null;
        };

        if(!isTouch){
            document.addEventListener(eventsName[1], move);
        }
    };

    const Quit = function(){
        canvas['on' + eventsName[0]] = null;
    };

    return {
        Start,
        Quit
    };
})();

export default Polygon;