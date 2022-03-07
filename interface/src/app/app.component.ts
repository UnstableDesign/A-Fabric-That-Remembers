import { Component } from '@angular/core';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import {environment} from '../environments/environment'


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

  login_email = 'admin email'; 
  login_password = 'password'; 
  user:any = null;
  showLoginFields = false;

  regions: Array<any> = [];


  c_blue = "rgb(11,66,110)";
  history_position:number = 50;
  view_mode:string = "present";
  history_resolution = 50; //adjust this if you want the history vis to be more or less detailed. 
  region_press_history: Array<Array<number>> = [];

  graph_cell_width: number = 0;

  data_in_el: any = null;
  data_count: number = 0;
  data_in: Array<{stamp: number, vals: Array<number>}> = [];
  oldest_stamp:number = 0;
  newest_stamp:number =  0;
  months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul","Aug","Sept","Oct","Nov","Dec"];
  
  current_hour = 0;
  hour_data: Array<number> = [];

  hs: any;




  constructor(firestore: AngularFirestore, private db: AngularFireDatabase, public auth: AngularFireAuth){
    this.regions.push({value: 0,target: 0,dbid: 0, min: 500, max: 1200,  background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 1, min: 500, max: 2000, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 2, min: 500, max: 1500, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 3, min: 500, max: 2000, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 4, min: 500, max: 2000, background_color:"rgba(255, 0, 0, 0.3)"});
    this.regions.push({value: 0,target: 0,dbid: 5, min: 500, max: 2000, background_color:"rgba(255, 0, 0, 0.3)"});



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


      this.auth.onAuthStateChanged((user) => {
        if (user) {
          // User is signed in, see docs for a list of available properties
          // https://firebase.google.com/docs/reference/js/firebase.User
          this.user = user.uid;
          // ...
        } else {
          // User is signed out
          // ...
          this.user = null;
        }
      });

      const non_zero: Array<number> = processed_data.filter(el => el != 0);
      if(non_zero.length > 0) this.logData(processed_data);

     
    });

    const itemRef = this.db.list<StampRow>('log');
    itemRef.valueChanges().subscribe((history) => {
        this.data_in = history;
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

  login() {
    this.auth.signInWithEmailAndPassword(this.login_email, this.login_password).then(el => {
      this.user = el.user?.uid;
    })
    .catch(err => {
      console.log(err);
      this.login_email = "error: try again"
      this.login_password = ""
    });
  }

  logout() {
    this.auth.signOut();
  }



processData(data_in:any, region: number) : number{


  if (data_in < this.regions[region].min) return 0;
  if(data_in > this.regions[region].max) return 255;
  return Math.floor(data_in / this.regions[region].max * 255);
}


handleTouchMove(evt:any) {

  if(this.hs === null) return;
  evt.preventDefault();

  let seg = 0;
  let offset = evt.touches[0].clientX - this.hs.offsetLeft;
  if(offset > 0){
    seg = Math.floor(offset / this.graph_cell_width);
  }

  if(seg >= this.history_resolution) seg = this.history_resolution-1;


  const overlay = document.getElementById("overlay");
  if(overlay !== null) overlay.style.left = (seg * this.graph_cell_width) +'px';


  this.history_position = seg;
  this.setHistoryColorValues(seg);

}

handleMouseMove(evt:any) {

  if(this.hs === null) return;
  evt.preventDefault();

  let seg = 0;
  let offset = evt.clientX - this.hs.offsetLeft;
  if(offset > 0){
    seg = Math.floor(offset / this.graph_cell_width);
  }

  if(seg >= this.history_resolution) seg = this.history_resolution-1;

  this.history_position = seg;
  this.setHistoryColorValues(seg);

  const overlay = document.getElementById("overlay");
  if(overlay !== null) overlay.style.left = (seg * this.graph_cell_width) +'px';

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


drawHistoryGraph(history_graph: Array<number>){

    this.clearHistoryGraph();

    const begin = document.getElementById("begin");
    const end = document.getElementById("end");
    const graph = document.getElementById("graph");
    const overlay = document.getElementById("overlay");

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

  
    if(graph === null) return;

    this.graph_cell_width = graph.offsetWidth/this.history_resolution;
    if(overlay !== null) overlay.style.width = this.graph_cell_width+"px";

		//draw the tick marks + bars
  	for(let i:number =0; i < this.history_resolution; i++){
       


       let div = document.createElement("div");
       div.classList.add("graph-segment")
       div.id = i.toString();
       div.style.height = "100%";
       div.style.width = this.graph_cell_width+"%";
       div.style.backgroundColor = "rgba(255,255,255,.5)";
       div.style.borderRight = "1px solid rgba(255,255,255,.5)";

      let measure = document.createElement("div");
      measure.classList.add("measurement");
      measure.style.height = (1-history_graph[i])*100+"%";
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
  }else if(this.regions[region].value > target_adjusted -5 && this.regions[region].value < target_adjusted +5){
    this.regions[region].target = 0;
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


/**
 * takes the database inputs and returns an array of size history resolution with the % amount of presses that accumulated in this 
 * region relative to the max. 
 * @returns 
 */
loadGraph() : Array<number> {

  //first, figure out the start and end time of each window
  if(this.data_in.length === 0) return [];

  console.log("data in", this.data_in);

   this.oldest_stamp = this.data_in[0].stamp;
   this.newest_stamp = this.data_in[this.data_in.length-1].stamp;

  var elapsed = this.newest_stamp - this.oldest_stamp; //total time
  var time_window = elapsed / this.history_resolution; 


  let max_presses_in_window = 0;
  let sums: Array<number> = [];

  for(let i = 0; i < this.history_resolution; i++){
    const window_min = this.oldest_stamp + (i * time_window);
    const window_max =  this.oldest_stamp + ((i+1) * time_window);
    const in_window: Array<{stamp:number, vals: Array<number>}> = this.data_in.filter(el => el.stamp > window_min && el.stamp <= window_max);
    console.log(in_window);

    const all_values_in_window:Array<Array<number>> = in_window.map(el => el.vals);
    let total:number = 0;
    for(let j = 0; j <  all_values_in_window.length; j++){
      for(let q = 0; q < all_values_in_window[j].length; q++){
        total += all_values_in_window[j][q];
      }
    }
    sums.push(total);
    if(total > max_presses_in_window) max_presses_in_window = total;

  }

  return sums.map(el => el / max_presses_in_window);


}


/**
 * calcuates the total forces captured within any timewindow and the % which came from each region
 * @returns 
 */
loadRegionHistoryData() : Array<Array<number>> {

  //first, figure out the start and end time of each window
  if(this.data_in.length === 0) return [];

   this.oldest_stamp = this.data_in[0].stamp;
   this.newest_stamp = this.data_in[this.data_in.length-1].stamp;

  var elapsed = this.newest_stamp - this.oldest_stamp; //total time
  var time_window = elapsed / this.history_resolution; 


  let region_values:Array<Array<number>> = [];

  for(let i = 0; i < this.history_resolution; i++){
    const window_min = this.oldest_stamp + (i * time_window);
    const window_max =  this.oldest_stamp + ((i+1) * time_window);

    const in_window: Array<{stamp:number, vals: Array<number>}> = this.data_in.filter(el => el.stamp > window_min && el.stamp <= window_max);
    const all_values_in_window:Array<Array<number>> = in_window.map(el => el.vals);
    
    let total:number = 0;
    let region_totals: Array<number> = [0, 0, 0, 0, 0, 0];
    for(let j = 0; j <  all_values_in_window.length; j++){
      for(let q = 0; q < all_values_in_window[j].length; q++){
        region_totals[q] += all_values_in_window[j][q];
        total += all_values_in_window[j][q];
      }
    }

    if(total !== 0){
      region_values.push(region_totals.map(el => el/total));
    }else{
      region_values.push(region_totals.map(el => 0));
    }
  }

  
  return region_values;


}



setHistoryColorValues(time: number){

  if(time < 0) time = 0;
  if(time >= this.history_resolution) time = this.history_resolution -1;

  const active_frame = this.region_press_history[time];
	for(var i = 0; i < 6; i++){
		this.regions[i].target = active_frame[i] *255;
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



  const history_graph = this.loadGraph();
  console.log("history graph", history_graph)
  this.drawHistoryGraph(history_graph);
  this.region_press_history = this.loadRegionHistoryData();


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
    if(this.user === environment.uid){
      console.log("logging data");
      const itemRef = this.db.object('log/'+timestamp_hours);
      itemRef.set({stamp: this.current_hour, vals: this.hour_data});
    }

 }





}
