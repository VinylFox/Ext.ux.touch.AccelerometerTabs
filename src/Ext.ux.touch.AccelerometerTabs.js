Ext.ns('Ext.ux.touch');
/**
 * @author Shea Frederick - http://www.vinylfox.com
 * @class Ext.ux.touch.AccelerometerTabs
 * <p>A plugin that lets the user shake the device back and forth to move through tabs. No configuration is needed.</p>
 * <p>Sample Usage</p>
 * <pre><code>
 {
     xtype: 'tabpanel',
     ...,
     plugins: [new Ext.ux.touch.AccelerometerTabs()],
     ...
 }
 * </code></pre>
 */
Ext.ux.touch.AccelerometerTabs = Ext.extend(Ext.util.Observable, {
  /**
   * @cfg {Number} threshold This number specifies the amount of force needed to trigger a tab change.
   */
  threshold: 10,
  /**
   * @cfg {Number} buffer The number of milliseconds to wait after a motion event has been triggered before triggering the next. 
   */
  buffer: 1000,
  /**
   * @cfg {Number} pollmod The modulus of how often to inspect motion data to determine if a shake happened. 
   */
  pollmod: 10,
  // private
  flicked: false,
  //private
  dmcnt: 0,
  constructor: function(config){
	Ext.apply(this, config || {});
  },
  init: function(cmp){
    this.cmp = cmp;
    this.setFn = (Ext.versionDetail.major === 0) ? 'Card' : 'ActiveItem'; 
    cmp.on('render', this.initAccelerometerHandlers, this);
    window.addEventListener("devicemotion", Ext.createDelegate(this.deviceMotion,this), true);
  },
  // private
  deviceMotion: function(event) {
  	if (this.dmcnt % this.pollmod && event.acceleration){
  		var orientation = (Ext.Viewport.getOrientation() == 'landscape')?'y':'x';
        if (!this.flicked && (event.acceleration[orientation] > this.threshold || event.acceleration[orientation] < (this.threshold*-1))){
          this.flicked = true;
          var ev = {
        	type: 'flick',
        	direction: (event.acceleration[orientation] < (this.threshold*-1))?'left':'right'
          };
          this.cmp.getActiveItem().fireEvent('devicemotion',ev);
          setTimeout(Ext.createDelegate(function(){
            this.flicked = false;
          },this),this.buffer);
        }
    }
	this.dmcnt++;
  },
  // private
  initAccelerometerHandlers: function(){
    this.cmp.til = this.cmp.items.length-1;
    this.cmp.items.each(function(itm, i){
    	itm.addEvents({'devicemotion':true});
	    if (itm.rendered){
	      this.addAccelerometer(itm, i);
	    }else{
	      itm.on('render', function(){ 
	        this.addAccelerometer(itm, i);
	      }, this);
	    }
    },this)
  },
  // private
  addAccelerometer: function(itm, i){
    if (i === 0){
      this.addAccelerometerLeft(itm, i);
    }else if(i === this.cmp.til){
      this.addAccelerometerRight(itm, i);
    }else{
      this.addAccelerometerLeft(itm, i);
      this.addAccelerometerRight(itm, i);
    }
  },
  // private
  addAccelerometerLeft: function(itm, i){
    itm.on('devicemotion', function(ev) {
      if (ev.type == "flick" && ev.direction == "left") {
        this.cmp['set'+this.setFn](i + 1);
      }
    }, this);
  },
  // private
  addAccelerometerRight: function(itm, i){
    itm.on('devicemotion', function(ev) {
      if (ev.type == "flick" && ev.direction == "right") {
        this.cmp['set'+this.setFn](i - 1, {type : 'slide', direction : 'right'});
      }
    }, this);
  }
});

Ext.preg('accelerometertabs', Ext.ux.touch.AccelerometerTabs);