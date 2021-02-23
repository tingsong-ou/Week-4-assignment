class barChart{
    constructor(){}

    //SETTERS
    setData(data){
        this.data = data;
        return this;
    }

    setSelection(selection){
        this.selection = selection;
        return this;
    }

    setMargin(margin){
        this.margin = margin;
        return this;
    }

    setSize(size){
        this.size = size;

        this.chartSize = {
            w: this.size.w - this.margin.l - this.margin.r,
            h: this.size.h - this.margin.t - this.margin.b
        }

        return this;
    }

    setDispatch(dispatch){
        this.dispatch = dispatch;

        this.dispatch.on('changeState',(state) =>{
            this.setFilterState(state);
            this.draw();
        });

        return this;
    }

    setFilterState(state){
        this.state = state;
        return this;
    }


    //DRAWING BARCHART
    draw(){ 
        let filteredData = this.data.filter(d => d.state == this.state);
        filteredData.sort((a, b) => b.cases - a.cases);


        //if more than 35 lines of data, only keep the first 35 rows, then print alert
        if(filteredData.length > 35){
            let countyCount = filteredData.length;
            filteredData = filteredData.slice(0, 35);

            let t = this.selection.selectAll('.alert').data([1]);

            t.join('text')
                .attr('x', 200)
                .attr('y', 675)
                .attr('class', 'alert')
                .transition()
                .duration(1000)
                .tween('text', function(){
                    let total = d3.interpolate(0, countyCount)
                    return function(t){
                        d3.select(this).text(`*This state has ${Math.round(total(t))} counties, here only shows 35 of them`);
                    }
                });
        }else{
            this.selection.selectAll('.alert')
                .remove();
        }


        //creating scales
        let scaleX = d3.scaleLinear()   
            .domain([0, d3.max(filteredData.map(d => d.cases))])
            .range([0, this.chartSize.w]);
        
        let scaleY = d3.scaleBand()
            .domain(filteredData.map(d => d.county))
            .range([0, this.chartSize.h])
            .padding(0.3);

        //drawing bars
        this.selection.attr('transform', `translate(${this.margin.l}, ${this.margin.t})`);

        let rectSelection = this.selection
            .selectAll('rect')
            .data(filteredData, (d, i) => i);

        rectSelection.enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', d => scaleY(d.county))
            .attr('width', 0)
            .attr('height', scaleY.bandwidth())
            .transition()
            .duration(1000)
            .attr('width', d => scaleX(d.cases));

        rectSelection
            .transition()
            .duration(1000)
            .attr('x', 0)
            .attr('y', d => scaleY(d.county))
            .attr('width', d => scaleX(d.cases))
            .attr('height', scaleY.bandwidth());

        rectSelection.exit()
            .transition()
            .duration(1000)
            .attr('width', 0)
            .remove();

        this.drawAxes(scaleX,scaleY);
        this.drawValues(filteredData, scaleX, scaleY);
    }

    //drawing axes
    drawAxes(scaleX, scaleY){
        this.drawAxisX(scaleX);
        this.drawAxisY(scaleY);
    }

    drawAxisX(scaleX){
        let axis = d3.axisBottom(scaleX);

        let axisG = this.selection.selectAll('g.axis-x')
            .data([1])
            .join('g')
            .classed('axis', true)
            .classed('axis-x', true);
        
        axisG
            .attr('transform', `translate(0, ${this.chartSize.h})`)
            .transition()
            .duration(1000)
            .call(axis);
    }

    drawAxisY(scaleY){
        let axis = d3.axisLeft(scaleY);

        let axisG = this.selection.selectAll('g.axis-y')
            .data([1])
            .join('g')
            .classed('axis', true)
            .classed('axis-y', true);
        
        axisG.transition()
            .duration(1000)
            .call(axis);
    }

    //placing values
    drawValues(data, scaleX, scaleY){
        let values = this.selection.selectAll('.value')
            .data(data);
        
        values.join('text')
            .attr('y', d => scaleY(d.county) + scaleY.bandwidth() / 2)
            .attr('class', 'value')
            .transition()
            .duration(1000)
            .attr('x', d => scaleX(d.cases) + 5)
            .tween('text', function(d){
                let currentValue = d.cases;
                let v = d3.interpolate(0, currentValue)
                return function(t){
                    d3.select(this).text(Math.round(v(t)));
                }
            });
        
        
    }
}