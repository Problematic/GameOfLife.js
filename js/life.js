(function (d3) {
    var LIVE = 1,
        DEAD = 2,
        LIVE_NEXT = 4,
        DEAD_NEXT = 8,
        LIVE_LAST = 16,
        DEAD_LAST = 32;

    var COLUMN_COUNT = 35,
        ROW_COUNT = 35;

    var CELL_WIDTH = 15,
        CELL_HEIGHT = 15,
        CELL_PADDING = 5;

    var dataset = [];

    for (var i = 0; i < COLUMN_COUNT; i++) {
        var column = [];
        for (var j = 0; j < ROW_COUNT; j++) {
            column.push([LIVE, DEAD][Math.floor(Math.random() * 2)]);
        }
        dataset.push(column);
    }

    var grid = d3.selectAll('.grid').append('svg:svg').append('svg:g');

    var getNeighbors = function (x, y) {
        var data = {};
        data[LIVE] = 0;
        data[DEAD] = 0;

        for (var dx = -1; dx <= 1; dx++) {
            for (var dy = -1; dy <= 1; dy++) {
                if (dx !== 0 || dy !== 0) {
                    if (dataset[x + dx] === undefined) {
                        data[DEAD]++;
                    } else {
                       data[dataset[x + dx][y + dy] & LIVE ? LIVE : DEAD]++;
                    }
                }
            }
        }

        return data;
    };

    var update = function () {
        var neighbors, x, y, column, cell, mask;

        for (x = 0, column; column = dataset[x]; x++) {
            while (column.length < ROW_COUNT) {
                column.push(DEAD);
            }

            for (y = 0, cell; cell = column[y]; y++) {
                neighbors = getNeighbors(x, y);

                if (cell & LIVE) {
                    mask = LIVE_LAST;
                    if (neighbors[LIVE] < 2 || neighbors[LIVE] > 3) {
                        mask |= DEAD_NEXT;
                    } else {
                        mask |= LIVE_NEXT;
                    }
                } else {
                    mask = DEAD_LAST;
                    if (neighbors[LIVE] === 3) {
                        mask |= LIVE_NEXT;
                    } else {
                        mask |= DEAD_NEXT;
                    }
                }

                dataset[x][y] |= mask;
            }
        }

        for (x = 0, column; column = dataset[x]; x++) {
            for (y = 0, cell; cell = column[y]; y++) {
                if (cell & DEAD_NEXT) {
                    dataset[x][y] = DEAD;
                } else if (cell & LIVE_NEXT) {
                    dataset[x][y] = LIVE;
                }
            }
        }
    };

    var render = function () {
        var columns = grid.selectAll('.column').data(dataset);

        columns.enter().append('svg:g')
            .attr('class', 'column');
        columns.exit().remove();

        var cells = columns.selectAll('.cell').data(function (d) {
            return d;
        });

        cells.enter().append('svg:rect')
            .attr('class', 'cell')
            .attr('width', CELL_WIDTH)
            .attr('height', CELL_HEIGHT)
            .attr('x', function (d, i, colIdx) {
                return colIdx * (CELL_WIDTH + CELL_PADDING);
            })
            .attr('y', function (d, i) {
                return i * (CELL_HEIGHT + CELL_PADDING);
            })
            .classed('live', function (d) {
                return d & LIVE;
            })
            .classed('dead', function (d) {
                return d & DEAD;
            });

        cells
            .classed('live', function (d) {
                return d & LIVE;
            })
            .classed('dead', function (d) {
                return d & DEAD;
            });

        cells.exit().remove();
    };

    var callback = function () {
        requestAnimationFrame(callback);

        update();
        render();
    };
    requestAnimationFrame(callback);
}(d3));
