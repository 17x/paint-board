import { isTouch, eventsName } from './Utils/Base';
import Pen from './Tool/Pen';
import Eraser from './Tool/Eraser';

const toolMap = {
    pen : Pen,
    eraser : Eraser
};

class PaintBoard{
    currentTool = null;
    strokeConfig = {
        strokeWidth : 1,
        strokeColor : '#000000'
    };
    lastMouseUpTimeStamp = null;
    isContinuous = null;

    constructor({ canvas, strokeConfig = {}, clearColor = '#ffffff', clearRadius = 16, ...rest }){
        this.props = rest;

        // operateCallback = null,
        // enableHistory = false,
        // historyMax = 10,
        let props = this.props;

        props.logicalWidth = Math.round(props.logicalWidth);
        props.logicalHeight = Math.round(props.logicalHeight);
        canvas.width = props.logicalWidth;
        canvas.height = props.logicalHeight;
        Object.assign(this.strokeConfig, strokeConfig);

        this.clearColor = clearColor;
        this.clearRadius = clearRadius;
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
    }

    OperatingStart(){
        /*if(this.history){
         this.isClean = false;
         this.ClearRedoList();
         // two operates interval less than 1000ms
         isContinuous = (Date.now() - lastMouseUpTimeStamp) < 1000;
         }*/
    }

    Operating(){}

    OperatingEnd(){
        this.lastMouseUpTimeStamp = Date.now();
        /*if(this.history){
         this.Snapshot(isContinuous);
         lastMouseUpTimeStamp = Date.now();
         }*/
    }

    Tool(toolName){
        const newTool = toolMap[toolName];

        // check enabled tool
        if(this.currentTool){
            if(this.currentTool === newTool){
                this.currentTool.Quit()
                    .then(() => {
                        this.currentTool = null;
                    });
            } else{
                this.currentTool = newTool;
                newTool.Start.apply(this);
            }
        } else{
            this.currentTool = newTool;
            newTool.Start.apply(this);
        }
    }
}

window.PaintBoard = PaintBoard;