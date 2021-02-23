class barChart{
    constructor(){
        this.duration = 1000; //controlling the overall duration
    }

//--------SETTERS--------

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

//--------CLASS FUNCTIONS--------

    //DRAWING BARCHART
    draw(){ 
        let filteredData = this.data.filter(d => d.state == this.state);
        filteredData.sort((a, b) => b.cases - a.cases);


        //if more than 35 lines of data, only keep the first 35 rows, then print alert
        if(filteredData.length > 35){
            let countyCount = filteredData.length;
            filteredData = filteredData.slice(0, 35);

            let alert = this.selection.selectAll('.alert').data([1]);

            alert.join('text')
                .attr('x', this.chartSize.w/2)
                .attr('y', -8)
                .attr('class', 'alert')
                .style('text-anchor','middle')
                .transition()
                .duration(this.duration)
                .tween('text', function(){
                    let total = d3.interpolate(0, countyCount)
                    return function(t){
                        d3.select(this).text(`*This state has ${Math.round(total(t))} counties; this chart only lists the top 35 cases confirmed counties.`);
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
            .duration(this.duration)
            .attr('width', d => scaleX(d.cases));

        rectSelection
            .transition()
            .duration(this.duration)
            .attr('x', 0)
            .attr('y', d => scaleY(d.county))
            .attr('width', d => scaleX(d.cases))
            .attr('height', scaleY.bandwidth());

        rectSelection.exit()
            .transition()
            .duration(this.duration)
            .attr('width', 0)
            .remove();

        this.drawAxes(scaleX,scaleY);
        this.drawValues(filteredData, scaleX, scaleY);
        this.drawLabels();
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
            .duration(this.duration)
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
            .duration(this.duration)
            .call(axis);
    }

    //placing values
    drawValues(data, scaleX, scaleY){
        let values = this.selection.selectAll('.value')
            .data(data);
        
        values.join('text')
            .attr('y', d => scaleY(d.county) + scaleY.bandwidth() / 2 + 4)
            .attr('class', 'value')
            .transition()
            .duration(this.duration)
            .attr('x', d => scaleX(d.cases) + 5)
            .tween('text', function(d){
                let currentValue = d.cases;
                let v = d3.interpolate(0, currentValue)
                return function(t){
                    d3.select(this).text(Math.round(v(t)));
                }
            });
        
        
    }

    //placing title and labels
    drawLabels(){
        let labelX = this.selection.selectAll('.label-x').data([1]);
        let labelY = this.selection.selectAll('.label-y').data([1]);
        let title = this.selection.selectAll('.chartTitle').data([1]);

        labelX.join('text')
            .attr('x', this.chartSize.w/2)
            .attr('y',this.chartSize.h + this.margin.b)
            .attr('class', 'label label-x')
            .text('Cases Confirmed')
        
        labelY.join('text')
            .attr('x', -this.chartSize.h/2)
            .attr('y', -this.margin.l*4/5)
            .attr('transform', 'rotate(-90)')
            .attr('class', 'label label-y')
            .text('Counties')
        
        title.join('text')
            .attr('x', this.chartSize.w/2)
            .attr('y', -this.margin.t/2)
            .style('text-anchor','middle')
            .style('font-size', '16px')
            .style('font-weight', '800')
            .attr('class', 'chartTitle')
            .text(`Cases Confirmed in ${this.state}`)
    }
}