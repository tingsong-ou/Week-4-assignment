gsap.registerPlugin(ScrollTrigger);

class ScrollActions{
    constructor(){
    };


    //CLASS FUNCTIONS

    setDispatch(dispatch){
        this.dispatch = dispatch;
        return this;
    }

    //ping chart
    trigger(){
        gsap.to('.chart', {
            scrollTrigger: {
                trigger: '.banners',
                start: 'top 8%',
                end: 'bottom bottom',
                pin: '.chart',
                pinSpacing: false,
                id: 'pin',
                markers: false
            }
        });

        //creating scrolling actions for each banner
        let elements = document.getElementsByClassName('stateBanner');
        elements = Array.from(elements);
        
        elements.forEach((ele, i) => {
            let eleId = ele.getAttribute('id');
            gsap.to(`#${eleId}`, {
                scrollTrigger: {
                    trigger: `#${eleId}`,
                    start: 'top center',
                    end: 'bottom center',
                    id: ele.getAttribute('value'),
                    onEnter: () =>{
                        let stateName = ele.getAttribute('value');
                        this.dispatch.call('changeState', this, stateName);
                        //console.log(stateName);
                    },
                    onEnterBack: () => {
                        let stateName = ele.getAttribute('value');
                        this.dispatch.call('changeState', this, stateName);
                        //console.log(stateName);
                    },
                    markers: false
                }
            })
        });
    }
}