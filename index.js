
let data = [
  {
    "id":1,
    "name": "John",
    "mail": "john@test.net",
    "function":"boss",
    "manager":0
  },
  {
    "id":2,
    "name": "Andy",
    "mail": "andy@test.net",
    "function":"sub boss 1",
    "manager":1
  },
  {
    "id":3,
    "name": "Marta",
    "mail": "marta@test.net",
    "function":"sub boss 2",
    "manager":1
  },
  {
    "id":4,
    "name": "Jeffs",
    "mail": "jeffs@test.net",
    "function":"employee",
    "manager":2
  },
  {
    "id": 5,
    "name": "John",
    "mail": "john2@test.net",
    "function":"employee",
    "manager":2
  },
  {
    "id": 6,
    "name": "Gerry",
    "mail": "Gerry@test.net",
    "function":"boss to be",
    "manager":2
  },
  {
    "id": 7,
    "name": "Ana",
    "mail": "Ana@test.net",
    "function":"employee",
    "manager":3
  },
  {
    "id": 8,
    "name": "David",
    "mail": "David@test.net",
    "function":"employee",
    "manager":3
  },
  {
    "id": 9,
    "name": "Last",
    "mail": "Last@test.net",
    "function":"employee",
    "manager":8
  }
]


const directSubs = Object.groupBy(data,({manager})=>manager)
const maxElementsLvl = d3.max(Object.keys(directSubs).map((key)=>directSubs[key].length))
const orgChart=d3.select('svg');
let svgW = orgChart._parents[0].clientWidth
let svgH = orgChart._parents[0].clientHeight
const minSectionW = 150
const maxSectionW = 350
const minSectionH = 150
const gapW = 10
const gapH = 20

const sectionH = minSectionH
// const sectionW = svgW / maxElementsLvl - gapW*maxElementsLvl
const sectionW = Math.min(maxSectionW,Math.max(minSectionW,svgW / maxElementsLvl - gapW*maxElementsLvl))

const textStyleSettings = {
  font : {
    color: "black",
    size: "1em"
  },
  padding: 10
}

const infoArray = ["name", "mail", "function"]


//color use default if none in row is selected, for selected use

// const fColor = "#0f0ce8" //default
// const fColorUnSel = "0f0ce8"+"bf"
// const fColorSel = "#0f0ce8"


function FindLvl(data,id, lvl) {
  const mngId = data.filter(d=>d.id===id)[0].manager
  if (mngId == 0) {
    return lvl
  } else {
    return FindLvl(data,mngId,lvl+1)
  }
}

data.forEach(d=> {
  d.lvl = FindLvl(data,d.id,1)
})
const maxLvl = d3.max(data.map(d=>d.lvl))

orgChart
  .attr('width',svgW)
  .attr('height',svgH)


function drawLevel(dataOrg, level){

  const data = dataOrg.filter(d=>d.lvl===level)

  orgChart.append('g').attr("id","level"+level)
     .selectAll('rect')
     .data(data)
     .join('rect')
     .attr('x',d=>{
                        const nData = data.filter(el=>el.lvl===d.lvl)
                        const elL = nData.length
                        const ind = nData.map(el=>el.id).indexOf(d.id)
                        return ((svgW - (elL*sectionW+gapW*(elL-1)))/2)+(ind*(sectionW+gapW))
                      })
     .attr('y',d=> gapH+(d.lvl-1)*(gapH+sectionH))
     .attr('height',sectionH)
     .attr('width',sectionW)
      // .style('fill',fColor)
     .classed('unselected',true)
     .on('click', e=>{
       d3.select(`g#level${e.target.__data__.lvl}`).selectAll('rect').classed('unselected',true).classed('selected',false)
       d3.select(e.target).classed('unselected',false).classed('selected',true)
       for (step=e.target.__data__.lvl+1; step<=maxLvl; step++){
        orgChart.select("#level"+step).remove()
        orgChart.select(`#levelLine${step}`).remove()
       }
       //draw lines
       if ((dataOrg.filter(d=>(d.manager===e.target.__data__.id))).length>0){
       orgChart
        .append('g')
        .attr("id",`levelLine${level+1}`)
        .append("line")
        .style("stroke","black")
        .attr("x1",+d3.select(e.target).attr("x")+sectionW/2)
        .attr("y1",+d3.select(e.target).attr("y")+sectionH)
        .attr("x2",+d3.select(e.target).attr("x")+sectionW/2)
        .attr("y2",+d3.select(e.target).attr("y")+sectionH+gapH/2)
      }

       const dataRel = dataOrg.filter(d=>(d.manager===e.target.__data__.id||d.lvl>e.target.__data__.lvl+1))
       if (dataRel.length>0){
          drawLevel(dataRel,level+1)
       }

     })
     // .on('mo')

     // d3.selectAll('text').remove()
     d3.select("#level"+level)
        .selectAll('g.text')
        .data(data)
        .join('g')
        .classed('text',true)
        // .text(d=>d.name)
        .attr("transform",(d,i)=>`translate(${+d3.select("#level"+level).selectAll("rect").nodes()[i].getAttribute("x")+textStyleSettings.padding},${3*gapH+(d.lvl-1)*(gapH+sectionH)})`)

        const textEls = d3.select("#level"+level).selectAll('g.text').append('text')
        .attr('fill',textStyleSettings.font.color)
        .style('font-size',textStyleSettings.font.size)


infoArray.forEach((item) => {
  textEls
  .append('tspan')
  .text(d=>d[item])
  .attr('x',0)
  .attr('dy','1.2em')
});

        //
        // textEls
        // .append('tspan')
        // .text(d=>d["name"])
        // .attr('x',0)
        // .attr('dy','1.2em')
        //
        // textEls
        // .append('tspan')
        // .text(d=>d.function)
        // .attr('x',0)
        // .attr('dy','1.2em')

        if (level>1) {
          const rects = orgChart.select(`g#level${level}`)
             .selectAll('rect')

             //horizontal line
            orgChart.select(`#levelLine${level}`)
              .append("line")
              .style("stroke","black")
              .attr("x1",Math.min(+d3.select(rects.nodes()[0]).attr("x")+sectionW/2,orgChart.select(`#levelLine${level}`).select('line').attr('x1')))
              .attr("y1",+d3.select(rects.nodes()[0]).attr("y")-gapH/2)
              .attr("x2",Math.max(+d3.select(rects.nodes()[rects.nodes().length-1]).attr("x")+sectionW/2,orgChart.select(`#levelLine${level}`).select('line').attr('x1')))
              .attr("y2",+d3.select(rects.nodes()[0]).attr("y")-gapH/2)

              //lines from lower parts

            orgChart.select(`#levelLine${level}`)
             .selectAll('line.up')
             .data(data)
             .join("line")
             .classed('up',true)
             .style("stroke","black")
             .attr("x1",(d,i)=>+d3.select(rects.nodes()[i]).attr("x")+sectionW/2)
             .attr("y1",(d,i)=>+d3.select(rects.nodes()[i]).attr("y")-gapH/2)
             .attr("x2",(d,i)=>+d3.select(rects.nodes()[i]).attr("x")+sectionW/2)
             .attr("y2",(d,i)=>+d3.select(rects.nodes()[i]).attr("y"))
        }
}

drawLevel(data,1)
