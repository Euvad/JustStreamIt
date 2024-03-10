class SmoothCarousel{
  version = 0.1;
  el = null;
  items = [];
  size = 3;
  activeClass = true;
  gap = 0;
  item= {
    width: 0,
    gap: 0,
    left: 0,
  };
  constructor(el, settings = {}){
    console.log("SmoothCarousel v"+ this.version + " init");
    this.el = el;
    this.items = el.getElementsByClassName("hdcarousel_item");
    console.log(this.items.length);
    const nav = this.el.parentElement.getElementsByClassName("smoothcarousel__nav__button");
    for(let i = 0; i < nav.length; i++){
      nav[i].addEventListener("click", () => this.move(nav[i]));
    }
    this.init();
  }

  async init(){
    await this.setMinItems();
    this.item.width = await this.getSize();
    this.el.style.height = this.items[0].clientHeight + "px";
    await this.clone("prev");
    await this.build();
  }
  async setMinItems(){
    const minItems = this.size + 2;
    if (this.items.length < minItems){
      let itemsLength = this.items.length;
      for(let i = 0; i < itemsLength; i++){
        let c = this.items[i].cloneNode(true);
        this.el.append(c);
      }
    }
    if (this.items.length < minItems){
      await this.setMinItems();
    }

  }
  async getSize(){
    let w = this.el.clientWidth;
    w = w / this.size - this.gap;
    return w;
  }
  async build(){
    let l = this.item.width * -1;
    for(let i = 0; i < this.items.length; i++){
      this.items[i].style.width = this.item.width + "px";
      this.items[i].style.left = l + "px";
      l = l + this.item.width;
      if (i > 0){
        l = l + this.gap;
      }
    }
    if (this,this.activeClass){
      this.setActive();
    }
  }
  async clone(pos = "next"){
    let item = 0;
    if(pos === "next"){
      item = this.items[0];
    } else {
      item = this.items[this.items.length - 1];
    }
    let c = item.cloneNode(true);
    if (pos === "next"){
      this.el.append(c);
    } else {
      this.el.prepend(c);
    }
    item.remove();
  }
  async move(el){
    let pos = el.getAttribute("data-dir");
    if (pos === "next"){
      this.next();
    } else {
      this.prev();
    }

  }
  async next(){
    await this.clone("next");
    await this.build();
  }
  async prev(){
    await this.clone("prev");
    await this.build();
  }
  setActive(){
    let m = Math.round(this.size / 2);
    for(let i = 0; i < this.items.length; i++){
      this.items[i].classList.remove("hdcarousel_item_active");
      if(i === m){
        this.items[i].classList.add("hdcarousel_item_active");
      }
    }
  }
}

const el = document.getElementById("carousel");
new SmoothCarousel(el);