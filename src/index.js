import { isTouch, eventsName } from './Utils/Base';
import PenTool from './Tool/Pen';
// import PenTool from './Tool/Eraser';

const toolMap = {
    pen : PenTool
};

class PaintBoard{
    currentTool = null;
    strokeConfig = {
        strokeWidth : 1,
        strokeColor : '#000000'
    };

    constructor(props){
        let { canvas, strokeConfig = {} } = props;
        // operateCallback = null,
        // enableHistory = false,
        // historyMax = 10,
        props.logicalWidth = Math.round(props.logicalWidth);
        props.logicalHeight = Math.round(props.logicalHeight);
        canvas.width = props.logicalWidth;
        canvas.height = props.logicalHeight;
        Object.assign(this.strokeConfig, strokeConfig);

        this.props = props;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    Tool(toolName){
        const newTool = toolMap[toolName];

        if(this.currentTool){
            this.currentTool.Quit()
                .then(() => {
                    newTool.Start.apply(this);
                });
        } else{
            newTool.Start.apply(this);
        }
    }
}

window.PaintBoard = PaintBoard;