const Clear = () => {
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.isClean = true;
    if(this.history){
        this.ClearRedoList();

        let _b = false;

        if(this.historyIndex > -1){
            _b = this.historyStack[this.historyIndex].t === 'clear';
        }
        this.Snapshot(_b);
    }
};