import { HostListener, Component, Renderer2 as renderer } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase } from '@angular/fire/compat/database';



export interface StampRow{
  stamp: number,
  vals: Array<number>
}

export interface DataHistory{
 data: Array<StampRow>; 
}



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {

  title = 'AFtR';
  data: any;
  LOGMAX = 650000;


  regions: Array<any> = [];


  c_blue = "rgb(11,66,110)";
  history_position:number = 50;
  view_mode:string = "present";
  history_resolution = 50; //adjust this if you want the history vis to be more or less detailed. 
  
  fp_timewindow = {
    history: <Array<Array<number>>>[],
    max: 0
  };
  reg_timewindow = {
    history: <Array<Array<number>>>[],
    max: 0
  };

  data_log: Array<any> = [];
  data_in_el: any = null;
  data_count: number = 0;

  
  oldest_stamp:number = 0;
  newest_stamp:number =  0;
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sept","Oct","Nov","Dec"];
  
  current_hour = 0;
  hour_data: Array<number> = [];

  hs: any;


  constructor(firestore: AngularFirestore, private db: AngularFireDatabase){
    this.regions.push({value: 0,target: 0,dbid: 0, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 1, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 2, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 3, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 4, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 5, background_color:"rgba(255, 0, 0, 0.3)"});

  }

  



  ngOnInit() : void {


    const ref = this.db.list('pressdata');
    ref.valueChanges().subscribe((data) => {


      const processed_data: Array<number> = data.map((el, ndx) => this.processData(el, ndx));
     
      this.data_count++;     

      if(this.view_mode === 'present'){
        processed_data.forEach((val, ndx) => {
         this.regions[ndx].target = val;
       });
      }

      if(this.data_in_el !== null){
        this.data_in_el.style.color = "red";
        this.data_in_el.innerHTML = "data count: "+this.data_count+", data in: "+processed_data;   
      }

     
    });

    const itemRef = this.db.list<StampRow>('log');
    itemRef.valueChanges().subscribe((history) => {
      this.data_log = [];

        history.forEach(row => {
          row.vals.forEach((val, reg) =>{
            this.data_log.push({
                timestamp: row.stamp,
                region: reg,
                value: val});
            });
          });
        });
    

  }

  ngAfterViewInit(){
    const body = document.getElementById('sketch'); 
    this.data_in_el = document.getElementById('datain');     
    this.hs = document.getElementById("history_slider");

    this.regions.forEach((reg, i) => {
      this.regions[i].el = document.getElementById('region_'+(i+1));
    });

    window.requestAnimationFrame(() => this.draw());

  }



processData(data_in:any, region: number) : number{
  let min = 100;
  let max = 1000;
  if(region == 3){
    min = 500;
    max = 1500;
  }


  if (data_in < min) return 0;
  if(data_in > max) return 255;
  return Math.floor(data_in / max * 255);
}


handleTouchMove(evt:any) {

  if(this.hs === null) return;
  evt.preventDefault();

  let seg = 0;
  let offset = evt.touches[0].clientX - this.hs.offsetLeft;
  if(offset > 0){
    seg = Math.floor(offset / this.history_resolution);
  }

  if(offset > this.hs.offsetWidth) seg = 50;

  this.history_position = seg;
  this.setHistoryColorValues(seg);

}

handleMouseMove(evt:any) {

  if(this.hs === null) return;
  evt.preventDefault();

  let seg = 0;
  let offset = evt.clientX - this.hs.offsetLeft;
  if(offset > 0){
    seg = Math.floor(offset / this.history_resolution);
  }

  if(offset > this.hs.offsetWidth) seg = 50;

  this.history_position = seg;
  this.setHistoryColorValues(seg);

}





 draw() {

  if(this.view_mode !== 'present'){
    this.setHistoryColorValues(this.history_position);
  }

  this.regions.forEach((reg, ndx) => {
    reg.el.style.backgroundColor = this.getColor(ndx);
  })
  



  window.requestAnimationFrame(() => this.draw());
  

}


/*updated to new date format */
drawHistoryGraph(){

    this.clearHistoryGraph();

    const begin = document.getElementById("begin");
    const end = document.getElementById("end");
    const graph = document.getElementById("graph");
   
    this.hs.style.display = "flex";

  	var date_begin = new Date();
    var date_end = new Date();

    if(this.oldest_stamp !== 0){
        date_begin.setMilliseconds((this.oldest_stamp*1000*3600)-Date.now());
        date_end.setMilliseconds((this.newest_stamp*1000*3600)-Date.now());
    }

  	var begin_str =date_begin.getDate()+"-"+ this.months[date_begin.getMonth()]+"-"+date_begin.getFullYear();
    if(begin !== null) begin.innerHTML = begin_str;

  	var end_str = date_end.getDate()+"-"+ this.months[date_end.getMonth()]+"-"+date_end.getFullYear();
    if(end !== null) end.innerHTML = end_str;


    console.log("graph", graph)

  
    if(graph === null) return;

		//draw the tick marks + bars
  	for(let i:number =0; i < this.history_resolution; i++){

       let y = this.fp_timewindow.history[i][6] / this.fp_timewindow.max * graph.offsetHeight;
       if(y <=0) y = 10;
       if(y >= 100) y = 90;

       let div = document.createElement("div");
       div.classList.add("graph-segment")
       div.id = i.toString();
       div.style.height = "100%";
       div.style.width = graph.offsetWidth/this.history_resolution+"%";
       div.style.backgroundColor = "rgba(255,255,255,.5)";
       div.style.borderRight = "1px solid rgba(255,255,255,.5)";

      let measure = document.createElement("div");
      measure.classList.add("measurement");
      measure.style.height = y+"%";
      measure.style.backgroundColor = "rgb(11,66,110)"
      div.appendChild(measure);
      graph.appendChild(div);

  	}
}

clearHistoryGraph(){
      const graph = document.getElementById("graph");
      if(graph === null) return;
      while (graph.firstChild) {
        graph.removeChild(graph.firstChild);
     }
}






//note, changing these values makes the transition faster
getColor(region: number){

  let target_adjusted = this.regions[region].target;

    if(this.regions[region].value < target_adjusted){
      this.regions[region].value += 10;

    }else if(this.regions[region].value === target_adjusted){
      if(this.view_mode === "present") this.regions[region].target = 0;

    }else{
      this.regions[region].value -= 10;
    }

  var opacity = (this.regions[region].value)/255;


  if(this.view_mode === "present"){
    return "rgba(255,0,0,"+opacity+")";
  }else{
    return "rgba(255, 255, 255,"+opacity+")";
  }

}


//this loads the current log data and organizes it into structutres by region and time window for visualization
loadHistory(){

  //store data for each region
 	this.reg_timewindow.history = [];
 	this.reg_timewindow.max = 0;

  //store data for each frame in the history
 	this.fp_timewindow.history = [];
 	this.fp_timewindow.max = 0;


 	for(var i = 0; i <= this.history_resolution; i++){
 		this.fp_timewindow.history.push([]);

    this.regions.forEach((reg, j) => {
      console.log(this.fp_timewindow);
      this.fp_timewindow.history[i].push(0);
    })

 		//write an extra element for totals
 		this.fp_timewindow.history[i].push(0);
 	}

  this.regions.forEach((reg, i) => {
    this.reg_timewindow.history.push([]);
    for(var j = 0; j <= this.history_resolution; j++){
      this.reg_timewindow.history[i].push(0);
    }
    //write an extra element for totals
    this.reg_timewindow.history[i].push(0);
  })

 	//this function should show the total accumulated force within the time window saved.
  
    if(this.data_log.length == 0) return;
    console.log("log loaded", this.data_log)

    this.oldest_stamp = parseInt(this.data_log[0].timestamp);
    this.newest_stamp = parseInt(this.data_log[0].timestamp);
  
    for(var d in this.data_log){
    	if(parseInt(this.data_log[d].timestamp) > this.newest_stamp) this.newest_stamp = parseInt(this.data_log[d].timestamp);
    	if(parseInt(this.data_log[d].timestamp) < this.oldest_stamp) this.oldest_stamp = parseInt(this.data_log[d].timestamp);
    }
  
     	var elapsed = this.newest_stamp - this.oldest_stamp;
     	var time_window = elapsed / this.history_resolution; 
   
  
     	//does not require values ot be in order
     	//writes an array of [time window][region][total force within time region]
  
      for(var d in this.data_log){
      	var time_diff = parseInt(this.data_log[d].timestamp) - this.oldest_stamp;
     		var cur_window = Math.floor((this.data_log[d].timestamp - this.oldest_stamp) / time_window);
        
         if(time_window === 0) cur_window  = 0;
         console.log("window", cur_window);

     		let window_array = this.fp_timewindow.history[cur_window];
     	  window_array[parseInt(this.data_log[d].region)] = window_array[parseInt(this.data_log[d].region)] +parseInt(this.data_log[d].value);  
     	   	//window_array[this.data_log[d].region] = int(window_array[this.data_log[d].region]) +1;  
  
     	  let region_array =  this.reg_timewindow.history[parseInt(this.data_log[d].region)];
     	  region_array[cur_window] = region_array[parseInt(this.data_log[d].region)] + parseInt(this.data_log[d].value);
     	   	//region_array[cur_window] = int(region_array[this.data_log[d].region]) + 1;
     	}
  
  
     	//now go through and caulculate the total forces by timewindow
     	for(var f in this.fp_timewindow.history){
     		var t = 0;
     		for(var i = 0; i < 6; i++){
     			t += this.fp_timewindow.history[f][i];
     		}
     		this.fp_timewindow.history[f][6] = t;
     		if(t > this.fp_timewindow.max) this.fp_timewindow.max = t;
      }
  
      //	now go through and caulculate the total forces by region
     	for(var r in this.reg_timewindow.history){
     		var t = 0;
     		var l = this.reg_timewindow.history[r].length -1;
     		for(var i = 0; i < l; i++){
     			t += this.reg_timewindow.history[r][i];
     		}
     		this.reg_timewindow.history[r][l] = t;
     		if(t > this.reg_timewindow.max) this.reg_timewindow.max = t;
      }
  
       
  
     let history_value = [];
  
  
    //set history values to most and least pressed
    for(r in this.reg_timewindow.history){
    //	var last_value = this.reg_timewindow.history[r].length - 2;
      this.setHistoryColorValues(parseInt(r));
    }

   

 }


setHistoryColorValues(time: number){



	let history_value = [0,0,0,0,0,0];
	var ndx = 0;

	for(var r in this.reg_timewindow.history){
		for(var t = 0; t < time; t++){
			history_value[r] = history_value[r] + this.reg_timewindow.history[r][t];
		}
	}

	for(var i = 0; i < 6; i++){
		history_value[i] = (history_value[i] / this.reg_timewindow.max)*255;
    this.regions[i].target = history_value[i]
	}


	
}

swapToPastMode() {

  console.log("swap to past");

  this.view_mode = "past";

  const body = document.getElementById("sketch");
  const title = document.getElementById("title");
  const button_present = document.getElementById("present");
  const button_past = document.getElementById("past");
  const live = document.getElementById("key");
  const map = document.getElementById("map");


  if(live !== null) live.style.display = "none";

  if(title != null) title.style.color = "white";

  if(map !== null){
    map.style.border= "1px solid white";
  }  


  if(this.hs !== null){
    this.hs.style.display= "flex";
  }  

  if(body !== null){
    body.style.backgroundColor = this.c_blue;
    body.style.color = "white";
    
  }


  if(button_present !== null){
    button_present.style.backgroundColor = "#0b426e";
    button_present.style.color="white";
    button_present.style.border = "thin solid white";
  
  }

  if(button_past !== null){
    button_past.style.backgroundColor = "white";
    button_past.style.color="#0b426e";
    button_past.style.border = "thin solid white";
  
  }



   this.loadHistory();
   this.drawHistoryGraph();


}

 swapToPresentMode(){
  this.view_mode = "present";


  const body = document.getElementById("sketch");
  const title = document.getElementById("title");
  const button_present = document.getElementById("present");
  const button_past = document.getElementById("past");
  const live = document.getElementById("key");
  const map = document.getElementById("map");
  const hs = document.getElementById("history_slider");

  this.hs.style.display = "none";
  if(live !== null) live.style.display = "flex";
  if(map !== null) map.style.border= "1px solid red";
  if(title != null) title.style.color = "red";


  if(body !== null){
    body.style.backgroundColor = "#ffffff";
    body.style.color = "red";
  }

  if(button_present !== null){
    button_present.style.backgroundColor = "red";
    button_present.style.color="white";
    button_present.style.border = "thin solid red";
  
  }

  if(button_past!== null){
    button_past.style.backgroundColor = "white";
    button_past.style.color="red";
    button_past.style.border = "thin solid red";
  }


}



  //Update to Write to Local Storage.

  logData(data: Array<number>){



    // //get date in seconds
    let timestamp_seconds: number = Math.floor(Date.now() / 1000);
    let timestamp_hours: number = Math.floor(timestamp_seconds / 3600);

    if(this.current_hour === 0 || this.current_hour !== timestamp_hours){
      this.hour_data = data;
      this.current_hour = timestamp_hours;
    }else{
      for(let i = 0; i < 6; i++){
        this.hour_data[i]+= data[i];
      }

    }
    const itemRef = this.db.object('log/'+timestamp_hours);
    itemRef.set({stamp: this.current_hour, vals: this.hour_data});

 }





}
