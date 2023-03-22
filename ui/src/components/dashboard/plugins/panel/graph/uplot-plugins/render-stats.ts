
export const renderStatsPlugin = (textColor = 'red') => {
    let startRenderTime;

    function setStartTime() {
        startRenderTime = Date.now();
    }

    function drawStats(u) {
        let { ctx } = u;
        let { left, top, width, height } = u.bbox;
        let displayText = "Time to Draw: " + (Date.now() - startRenderTime) + "ms";

        ctx.save();

        ctx.fillStyle = textColor;
        ctx.textAlign = "left";
        ctx.textBaseline = "top";
        ctx.fillText(displayText, left + 10, top + 10);

        ctx.restore();
    }

    return {
        hooks: {
            drawClear: setStartTime,
            draw: drawStats,
        }
    };
}