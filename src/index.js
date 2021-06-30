class PaintBoard{
    static isTouch = /Android|iPhone|iPad|iPod|SymbianOS|Windows Phone/.test(navigator.userAgent);
    static eventsName = PaintBoard.isTouch ?
        [
            'touchstart',
            'touchmove',
            'touchend'
        ] : [
            'mousedown',
            'mousemove',
            'mouseup'
        ];
    currentTool = null;

    Tool(toolName){
        this.currentTool.Quit()
        if(this.currentTool){

        }
    }
}

window.PaintBoard = PaintBoard;