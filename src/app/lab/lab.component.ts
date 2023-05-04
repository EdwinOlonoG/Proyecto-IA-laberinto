import {Component} from '@angular/core';
import {fragment} from './fragment';
import {coord} from './coord';
import {Node} from './node';

@Component({selector: 'app-lab', templateUrl: './lab.component.html', styleUrls: ['./lab.component.css']})
export class LabComponent {
    public file : any;
    public map : fragment[] = [];
    public conjuntoA : Node[] = [];
    public openSet : any[] = [];
    public solutionHuman: Node = {
        col: 0,
        row: 0,
        parents: [],
        cost: 0,
        distance: 0,
        total: 0};
    public solutionOctopus: Node = {
        col: 0,
        row: 0,
        parents: [],
        cost: 0,
        distance: 0,
        total: 0};
    public alphabeth = [
        'A',
        'B',
        'C',
        'D',
        'E',
        'F',
        'G',
        'H',
        'I',
        'J',
        'K',
        'L',
        'M',
        'N',
        'O'
    ];
    public humanCost : any = {
        '0': '?',
        '1': 1,
        '2': 2,
        '3': 3,
        '4': 4
    };

    public octopusCost : any = {
        '0': '?',
        '1': 4,
        '2': 1,
        '3': '?',
        '4': 3
    };

    public humanStart = {
        col: 'H',
        row: '7'
    };

    public octopusStart = {
        col: 'N',
        row: '12'
    };

    public darkTemple = {
        col: 'K',
        row: '3'
    };

    public key : any = {
        col: 'N',
        row: '15'
    }

    public portal = {
        col: 'K',
        row: '10'
    }


    public loadFile(e : any) {
        this.file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            this.buildMap(reader.result);
        };
        reader.readAsText(this.file);
    }

    private buildMap(content : any) {
        let mapArray = content.replaceAll('\r\n', ',').split(',');
        let width = content.replaceAll(',', '').split('\r')[0].length;
        let height = mapArray.length / width;
        for (let i = 0; i < width; i++) {
            for (let j = 0; j < height; j++) {
                this.map.push({
                    terrain: mapArray[(
                            (i * 15)
                        ) + j],
                    col: this.alphabeth[j],
                    row: i,
                    isPortal: false,
                    isKey: false,
                    isTemple: false,
                    isHuman: false,
                    isOctopus: false,
                    visited: false,
                    initial: false,
                    needsDesicion: false,
                    cost: 0
                })
            }
        }
    }

    public getFragment(col : number, row : number): fragment {
        return this.map[row * 15 + col];
    }

    private getDistance(start : coord, end : coord): number {
        let distance = 0;
        if (start.col > end.col) {
            distance = start.col - end.col;
        } else {
            distance = end.col - start.col;
        }
        if (end.row > start.row) {
            distance = distance + end.row - start.row;
        } else {
            distance = distance + start.row - end.row;
        }
        return distance;
    }

    public setPoints() {
        let col = this.alphabeth.indexOf(this.portal.col);
        let row = parseInt(this.portal.row) - 1;
        this.map[row * 15 + col].isPortal = true;

        col = this.alphabeth.indexOf(this.humanStart.col);
        row = parseInt(this.humanStart.row) - 1;
        this.map[row * 15 + col].isHuman = true;

        col = this.alphabeth.indexOf(this.octopusStart.col);
        row = parseInt(this.octopusStart.row) - 1;
        this.map[row * 15 + col].isOctopus = true;

        col = this.alphabeth.indexOf(this.key.col);
        row = parseInt(this.key.row) - 1;
        this.map[row * 15 + col].isKey = true;

        col = this.alphabeth.indexOf(this.darkTemple.col);
        row = parseInt(this.darkTemple.row) - 1;
        this.map[row * 15 + col].isTemple = true;

        return;
    }

    private checkDuplicate(node : any) {
        let c = this.openSet;
        for (let i = 0; i < c.length; i++) {
            if (c[i].col == node.col && c[i].row == node.row) {
                if (node.total<= c[i].total) {
                    // console.log('elimine a', c[i]);
                    c[i] = node;
                    return;
                }
            }
        }
        this.openSet.push(node);
    }

    private getCost(col : number, row : number, agent: string) {
      let terrain = this.getFragment(col, row).terrain;
      if (agent == 'human') {
          if (this.humanCost[terrain] == '?') {
              return -1;
          } else {
              return parseInt(this.humanCost[terrain]);
          }
      } else {
          if (this.octopusCost[terrain] == '?') {
              return -1;
          } else {
              return parseInt(this.octopusCost[terrain]);
          }
      }
  }

    private isParent(col : number, row : number, parent : any) {
        if (parent.parents.length == 0) {
            return false;
        }
        let p = parent.parents[parent.parents.length - 1];
        if (col == p.col && row == p.row) {
            return true;
        }
        return false;
    }

    private createNode(col : number, row : number, nodeParent : Node, agent: string, objetive: coord) {
        if (this.getCost(col, row, agent) == -1 || this.isParent(col, row, nodeParent)) {
            return;
        }
        const newCost = nodeParent.cost + this.getCost(col, row, agent);
        const distance = this.getDistance({col: col, row: row}, objetive);
        let parents = nodeParent.parents.slice();
        parents.push(nodeParent);

        this.getFragment(col, row).needsDesicion = true;
        this.getFragment(col, row).cost = newCost;
        const node: Node = {
            parents: parents, col: col, row: row, cost: newCost, distance: distance, total: newCost + distance
        }
        this.checkDuplicate(node);
    }

    private extend(node : Node, agent: string, objetive: coord) {
        let col = node.col;
        let row = node.row;
        this.getFragment(col, row).needsDesicion = false;
        this.getFragment(col, row).cost = 0;

        if (col != 0) {
            this.createNode(col - 1, row, node, agent, objetive);
        }
        if (col != 14) {
           this.createNode(col + 1, row, node, agent, objetive);
        }
        if (row != 0) {
            this.createNode(col, row - 1, node, agent, objetive);
        }
        if (row != 14) {
            this.createNode(col, row + 1, node, agent, objetive);
        }
        return;
    }

    private sortArray() {
        this.openSet.sort(function (a, b) {
            if (a.total> b.total) {
                    return 1;
                }
                if (a.total<b.total) {
                return -1;
            }
            return 0;
        });
    }

    findKey(agent : string) {
        const objetive = {
            col: this.alphabeth.indexOf(this.key.col), row: this.key.row - 1
        };
        this.findPath(agent, objetive);
        return 
    }

    findTemple(agent: string){
        const objetive = {
            col: this.alphabeth.indexOf(this.darkTemple.col), row: parseInt(this.darkTemple.row) - 1
        };
        this.findPath(agent, objetive);
        return;
    }

    findPortal(agent: string){
        const objetive = {
            col: this.alphabeth.indexOf(this.portal.col), row: parseInt(this.portal.row) - 1
        };
        this.findPath(agent, objetive);
        return;
    }

    findPath(agent : string, objetive : coord) {
        let node;
        if(this.openSet.length == 0){
            node = this.createStartNode(agent, objetive);
            this.extend(node, agent, objetive);
            this.sortArray();
        }
        node = this.openSet.shift();
        this.extend(node, agent, objetive);
        this.sortArray();
        if (objetive.col == node.col && objetive.row == node.row){
            node.parents.push(node);
            this.openSet = [node];
            return;
        }
        else {
            this.findPath(agent, objetive);
        }
        return;
    }

    createStartNode(agent: string, objetive: coord): Node{
        let col, row;
        if(agent == 'human'){
            col = this.alphabeth.indexOf(this.humanStart.col);
            row = parseInt(this.humanStart.row) - 1;
        } else{
            col = this.alphabeth.indexOf(this.octopusStart.col);
            row = parseInt(this.octopusStart.row) - 1;
        }
        let distance = this.getDistance({
            col: col, row: row
        }, objetive);
        let node = {
            col: col, row: row, cost: 0, parents: [], distance: distance, total: distance
        }
        return node;
    }
    solve(){
        let solutions = [];
        solutions.push(this.routeA());
        solutions.push(this.routeB());
        solutions.push(this.routeC());
        solutions.push(this.routeD());
        solutions.push(this.routeE());
        solutions.push(this.routeF());
        this.openSet = solutions;
        this.sortArray();
        console.log(this.openSet);
        this.drawPath(this.openSet[0].human, 0, (path: Node, index: number, callback: any )=>{setTimeout(()=> {
            this.drawPath(path, index, callback);
        }, 1000)});
        this.drawPath(this.openSet[0].octopus, 0, (path: Node, index: number, callback: any )=>{setTimeout(()=> {
            this.drawPath(path, index, callback);
        }, 1000)});
        this.solutionHuman = this.openSet[0].human;
        this.solutionOctopus = this.openSet[0].octopus;
    }
        
    routeA(){
        let route = {
            route: "Human: I-P Octopus: I-T-K-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.setPoints();
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findTemple('octopus');
        this.findKey('octopus');
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }

    routeB(){
        let route = {
            route: "Human: I-K-P Octopus: I-T-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.setPoints();
        this.findKey('human');
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findTemple('octopus');
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }

    routeC(){
        let route = {
            route: "Human: I-T-P Octopus: I-K-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.setPoints();
        this.findTemple('human');
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findKey('octopus');
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }

    routeD() {
        let route = {
            route: "Human: I-K-T-P Octopus: I-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.setPoints();
        this.findKey('human');
        this.findTemple('human');
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }

    routeE(){
        let route = {
            route: "Human: I-T-K-P Octopus: I-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.setPoints();
        this.findTemple('human');
        this.findKey('human');
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }

    routeF(){
        let route = {
            route: "Human: I-P Octopus: I-K-T-P",
            human: {},
            octopus: {},
            total: 0
        };
        this.findPortal('human');
        route.human = this.openSet[0];
        route.total = this.openSet[0].total;
        this.openSet = [];
        this.findKey('octopus');
        this.findTemple('octopus');
        this.findPortal('octopus');
        route.octopus = this.openSet[0];
        route.total = route.total + this.openSet[0].total;
        this.openSet = [];
        return route;
    }
    

    async drawPath(path : Node, index: number, callback : any) {
        if(index == path.parents.length){
            return;
        }
        if(index != 0)
        this.draw(path.parents[index]);
        callback(path, ++index, callback); 
    }
    
    async draw(node: Node){
            this.getFragment(node.col, node.row).visited = true;
    }
}

    
