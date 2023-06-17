odoo.define("DhtmlxGanttOtRenderer", function (require) {
    "use strict";
    const AbstractRendererOwl = require("web.AbstractRendererOwl");
    const patchMixin = require("web.patchMixin");
    const QWeb = require("web.QWeb");
    const session = require("web.session");
    const { useState } = owl.hooks;
    const components = {};

    var rpc = require('web.rpc');

    var events=[];

    //Doc : https://docs.dhtmlx.com/gantt/api__refs__gantt.html
    //TODO : 
    //- Faire une requette pour récupérer les projets
    //- Mettre les liens entre les proijets et les tâches
    //- Mettre la dure des tache et la progressoion reelle
    //- Pouvoir modiifer une tache en cliquant dessus
    //- Pouvoir modifier un projet en cliquant dessus





    class DhtmlxGanttOtRenderer extends AbstractRendererOwl {
        constructor(parent, props) {
            super(...arguments);
            this.qweb = new QWeb(this.env.isDebug(), { _s: session.origin });
            // this.state = useState({
            //     localItems: props.items || [],
            // });
            this.state   = useState({
                localItems: props.items || [],
                //'gantt' : {},
            });
            //events=[];
        }


        mounted() {
            gantt = gantt;
            // Je n'ai pas trouvé d'autre solution que d'intégrer l'objet owl dans l'objet gantt pour pouvoir 
            //l'utiliser dans les évènements du Gantt
            gantt.owl = this; 

            gantt.i18n.setLocale("fr");

            gantt.config.duration_unit = "hour";//an hour
            //gantt.config.duration_unit = "minute";//an hour
            gantt.config.duration_step = 1; //so if task.duration = 2 and step=3, the task will long 6 hours


            gantt.config.xml_date = "%Y-%m-%d %H:%i";
            gantt.scales = [
                { unit: "year", step: 1, format: "%Y" }
            ];

            // gantt.config.lightbox.sections = [
            //     {name: "description", height: 70, map_to: "text", type: "textarea", focus: true},
            //     {name: "time", type: "duration", map_to: "auto"}
            // ];
        
            // gantt.config.scale_height = 50;
        
            // gantt.config.scales = [
            //     {unit: "month", format: "%F, %Y"},
            //     {unit: "day", step: 1, format: "%D %j"}
            //     //{unit: "day", step: 1, format: "%j, %D"}
            // ];

            // gantt.attachEvent("onLightboxSave", function (id, task, is_new) {
            //     task.unscheduled = !task.start_date;
            //     return true;
            // });

            gantt.plugins({
                keyboard_navigation: true,
                undo: true,
                tooltip: true, /* Infobulle sur les taches => Cela fonctionne */
                marker: true,
            });


            // gantt.attachEvent("onGanttReady", function(){
            //     var tooltips = gantt.ext.tooltips;
            //     tooltips.tooltip.setViewport(gantt.$task_data);
            // });



            gantt.config.grid_width = 620;
            gantt.config.add_column = false;
            gantt.templates.grid_row_class = function (start_date, end_date, item) {
                if (item.progress == 0) return "red";
                if (item.progress >= 1) return "green";
            };
            gantt.templates.task_row_class = function (start_date, end_date, item) {
                if (item.progress == 0) return "red";
                if (item.progress >= 1) return "green";
            };

            //** Configuration des colonnes des tâches
            gantt.config.columns = [
                {name: "text", label: "Tâche", tree: true, width: 260},
                {name: "start_date", label: "Début", tree: true, width: 160},
                {
                    name: "progress", label: "%", width: 80, align: "center",
                    template: function (item) {
                        // if (item.progress >= 0.5)
                        //     return "Complete";
                        // if (item.progress == 0)
                        //     return "Not started";
                        return Math.round(item.progress * 100) + "%";
                    }
                },
                // {
                //     name: "assigned", label: "Assigné à", align: "center", width: 160,
                //     // template: function (item) {
                //     //     if (!item.users) return "Nobody";
                //     //     return item.users.join(", ");
                //     // }
                // },
                {name: "duration", label: "Durée", tree: true, width: 120},
            ];


            /* ZOOM */
            var zoomConfig = {
                levels: [
                    {
                        name:"hour",
                        scale_height: 45,
                        min_column_width:80,
                        scales:[
                            {unit: "day" , step: 1, format: "%D %d %F %Y"}, /* https://docs.dhtmlx.com/gantt/desktop__date_format.html */
                            {unit: "hour", step: 1, format: "%HH"},
                            {unit: "minute", step: 30, format: "%i"},
                        ]
                    },
                    {
                        name:"day",
                        scale_height: 45,
                        min_column_width:30,
                        scales:[
                            {unit: "day"   , step: 1, format: "%D %d %F %Y"}, /* https://docs.dhtmlx.com/gantt/desktop__date_format.html */
                            {unit: "hour"  , step: 1, format: "%HH"},
                            {unit: "minute", step: 30, format: "%i"},
                        ]
                    },
                    {
                        name:"week",
                        scale_height: 45,
                        min_column_width:25,
                        scales:[
                            {unit: "week", format: "%F %Y S%W"},
                            {unit: "day", format: "%d"},
                            {unit: "hour", step: 8, format: " "},
                        ]
                    },
                    {
                        name:"month",
                        scale_height: 45,
                        min_column_width:30,
                        scales:[
                            {unit: "month", format: "%F %Y"},
                            {unit: "week", format: "S%W"},
                            {unit: "day", format: "%d"},
                        ]
                    },
                    {
                        name:"year",
                        scale_height: 45,
                        min_column_width: 35,
                        scales:[
                            {unit: "year" , step: 1, format: "%Y"},
                            {unit: "month", step: 1, format: "%M"},
                        ]
                    }
                ],
                useKey: "ctrlKey",
                trigger: "wheel",
                element: function(){
                    return gantt.$root.querySelector(".gantt_task");
                }
            };
            gantt.ext.zoom.init(zoomConfig);


            gantt.message({
                text: "Ceci est un message" ,
                expire: 2000
            });


            gantt.config.sort = true;
            gantt.config.row_height = 25;


            /* Text à gauche de la task => https://docs.dhtmlx.com/gantt/desktop__timeline_templates.html */
            const formatter = gantt.ext.formatters.durationFormatter({
                format: ["day"]
            });
            gantt.templates.leftside_text = function(start, end, task){
                return formatter.format(task.duration);
            };

            /* Text à droite de la task */
            gantt.templates.rightside_text = function(start, end, task){
                return "ID: #" + task.id;
            };

            /* Text de progression de la task */
            gantt.templates.progress_text=function(start, end, task){
                return Math.round(task.progress*100);
            };

            /* Text de l'infobulle de la task */
            gantt.templates.tooltip_text = function(start,end,task){
                return "<b>Tâche:</b> "+task.text+
                "<br/><b>Début:</b> "+ gantt.templates.tooltip_date_format(start)+ 
                "<br/><b>Fin:</b> "+gantt.templates.tooltip_date_format(end)+
                "<br/>Durée:"+task.duration+
                "<br/><div style='color:red'>Autre:"+task.infobulle+"</div>";
            };

            //Met une couleur sur les task en fonction de la priority
            gantt.templates.task_class = function (start, end, task) {
                var cl="";
                switch (task.priority) {
                    case 0:
                        cl = "high";
                        break;
                    case 1:
                        cl = "medium";
                        break;
                    case 2:
                        cl= "low";
                        break;
                }
                return cl;
            };
    

            gantt.config.start_date = new Date(2023, 6, 17);



            // function showAll() {
            //     gantt.ignore_time = null;
            //     gantt.render();
            // }
        
            // function hideWeekEnds() {
            //     gantt.ignore_time = function (date) {
            //         return !gantt.isWorkTime(date, "day");
            //     };
            //     gantt.render();
            // }
        
            // function hideNotWorkingTime() {
            //     gantt.ignore_time = function (date) {
            //         return !gantt.isWorkTime(date);
            //     };
            //     gantt.render();
            // }



            //TODO : L'affichage des heures de femeyure entriaine obligairement le recalcul de la loguner de la tahce => Ne pas activer
            //gantt.config.work_time = true;
            //gantt.config.skip_off_time = true;  => Uniquement dans la version pro
            //gantt.setWorkTime({ hours:["8:00-12:00"] });
            //gantt.setWorkTime({ hours:["13:30-17:30"] });
            //gantt.setWorkTime({date:new Date(2023,3,19), hours:false});

            //TODO : Sans cette fonction, les heures de fermneure n'apparaiissent pas
            // gantt.templates.timeline_cell_class = function (task, date) {
            //     if (!gantt.isWorkTime({ date: date, task: task }))
            //         return "week_end";
            //     return "";
            // };


            // gantt.ignore_time = function (date) {
            //     return !gantt.isWorkTime(date, "day");
            // };




            gantt.init("gantt_here");


            console.log(gantt.getWorkHours(new Date(2033,3,20)));


            this.renderDhtmlxGantt();
        }


        patched() {
            this.renderDhtmlxGantt();
        }


        rnd() {
            //var x = Math.floor(Math.random()*100)/10;
            var x = Math.random();
            return x
        }
    

        renderDhtmlxGantt() {
            var data=[];
            var links=[];
            var item={};
            var vals={};
            var priority=0;
            var marker_id=0;

            // for (var x in this.props.items) {
            //     item = this.props.items[x];
            //     marker_id = item.id

            //     //Doc : https://docs.dhtmlx.com/gantt/desktop__task_properties.html
            //     vals={
            //         id:item.id,
            //         text:item.text,
            //         //start_date:item.date_assign,
            //         start_date:item.start_date,
            //         //duration:  Math.round(this.rnd()*100)+1,
            //         duration   : item.duration,
            //         progress   : this.rnd(),
            //         assigned   : item.assigned,
            //         priority   : priority,
            //         champ_perso: "Champ perso à mettre dans l'infobulle",
            //         parent     : item.parent,
            //     }
            //     data.push(vals);
            // }

            data  = this.props.items;
            links = this.props.links;


            gantt.clearAll(); 
            gantt.parse({
                data : data,
                links: links,
            });
            gantt.message({
                text: "Ceci est un autre message (test)" ,
                expire: 2000
            });




            //Positionner un marker sur une task pour pouvoir ensuite se déplacer dessus avec le bouton OKclickMarker
            if (marker_id>0){
                var current_time = gantt.getTask(marker_id).start_date;
                var text =  gantt.getTask(marker_id).text
                this.todayMarker = gantt.addMarker({ 
                    start_date: current_time, 
                    css: "today", 
                    text: "Marqueur pour "+text,
                });
            }
        
            // detach all saved events

            //console.log("events 1 = ",this.events, this.events.length);

            var ct=1
            while (events.length){
                //console.log("events 1 detach = ",ct,events);
                gantt.detachEvent(events.pop());
                ct=ct+1
            }

            //console.log("events 2 = ",events);



            //En cliqant sur une task, cela affiche la liste des clients d'Odoo
            events.push(gantt.attachEvent("onTaskClick", function(id,e){
                if (e.target.className=="gantt_task_content"){
                    gantt.owl.env.bus.trigger('do-action', {
                        action: {
                            type: 'ir.actions.act_window',
                            res_model: 'is.ordre.travail.line',
                            res_id: parseInt(id),
                            view_mode: 'form,list',
                            views: [[false, 'form'],[false, 'list']],
                            //target: 'current'
                            //target: 'new',
                        },
                    });
                }
                return true;
            }));

            //console.log("events 3 = ",this.events);


            //console.log(item.end_date, gantt.date.convert_to_utc(item.end_date));


            events.push(gantt.attachEvent("onAfterTaskUpdate", function(id,item){
                this.owl.WriteTask(id, item.end_date, item.duration);
            }));




            //TODO : Ne fonctionne pas
            // gantt.attachEvent("onLinkClick", function (id) {
            //     var link = this.getLink(id),
            //         src = this.getTask(link.source),
            //         trg = this.getTask(link.target),
            //         types = this.config.links;
        
            //     var first = "", second = "";

            //     switch (link.type) {
            //         case types.finish_to_start:
            //             first = "finish";
            //             second = "start";
            //             break;
            //         case types.start_to_start:
            //             first = "start";
            //             second = "start";
            //             break;
            //         case types.finish_to_finish:
            //             first = "finish";
            //             second = "finish";
            //             break;
            //     }
        
            //     var msg = "Must " + first + " <b>" + src.text + "</b> to " + second + " <b>" + trg.text + "</b>";
            //     gantt.message(msg);
            // });
        



            // gantt.parse({
            //     data: [
            //         { id:1, text:"Project #2", start_date:"01-04-2018", duration:18, progress:0.4, open:true },
            //         { id:2, text:"Task #1b"  , start_date:"02-04-2018", duration:8, progress:0.6, parent:1 },
            //         { id:3, text:"Task #2b"  , start_date:"11-04-2018", duration:8, progress:0.6, parent:1 }
            //     ],
            //     links: [
            //         { id:1, source:1, target:2, type:"1" },
            //         { id:2, source:2, target:3, type:"0" }
            //     ]
            // });
        }




        async WriteTask(id,date_deadline,planned_hours){
            //const date_utc = new Date(Date.UTC(date_deadline));
            //const isoDateString = new Date(date_deadline).toISOString();
            //const toUTCString   = new Date(date_deadline).toUTCString();
            //const d = new Date(date_deadline.getTime() - date_deadline.getTimezoneOffset()*60*1000);
    
            // const day = d.getDate();
            // const month = d.getMonth();
            // const year = d.getFullYear();
            
            // const hour = d.getHours();
            // const min = d.getMinutes();
            // const sec = d.getSeconds();
            // const utc_date = year+"-"+month+"-"+day+" "+hour+":"+min+":"+sec 
            

            var utc_date = gantt.date.convert_to_utc(date_deadline);
            var formatFunc = gantt.date.date_to_str("%Y-%m-%d %H:%i:%s");
            var heure_fin = formatFunc(utc_date);
            var vals={
                "heure_fin": heure_fin,
                "reste": planned_hours,
            }
            console.log(vals);
            var prom = rpc.query({
                model: 'is.ordre.travail.line',
                method: 'write',
                args: [[id], vals],
            });
        }
    
    
        OKclickAnnee(ev) {
            gantt.ext.zoom.setLevel("year");
            //console.log("min_date, max_date =",  gantt.getState().min_date,  gantt.getState().max_date);
        }
    
        OKclickMois(ev) {
            gantt.ext.zoom.setLevel("month");
            //console.log("min_date, max_date =",  gantt.getState().min_date,  gantt.getState().max_date);
        }
    
        OKclickSemaine(ev) {
            gantt.ext.zoom.setLevel("week");
            //console.log("min_date, max_date =",  gantt.getState().min_date,  gantt.getState().max_date);
        }
    
        OKclickJour(ev) {
            gantt.ext.zoom.setLevel("day");
            //console.log("min_date, max_date =",  gantt.getState().min_date,  gantt.getState().max_date);
        }
    
        OKclickHeure(ev) {
            gantt.ext.zoom.setLevel("hour");
            //console.log("min_date, max_date =",  gantt.getState().min_date,  gantt.getState().max_date);
        }
    
        OKclickMarker(ev) {
            var marker = gantt.getMarker(this.todayMarker);
            var marker_date = marker.start_date;
            gantt.showDate(marker_date)
        }
    
        OKclickGoToDate(ev) {
            var go_date = new Date();
            go_date.setDate(go_date.getDate()+14); //Date du jour + 14 jours
            gantt.showDate(go_date);
        }
    


        willUpdateProps(nextProps) {
            Object.assign(this.state, {
                localItems: nextProps.items,
            });
        }
    }


    Object.assign(DhtmlxGanttOtRenderer, {
        components,
        defaultProps: {
            items: [],
        },
        props: {
            items: {
                type: Array,
            },
            links: {
                type: Array,
            },
            arch: {
                type: Object,
                optional: true,
            },
            isEmbedded: {
                type: Boolean,
                optional: true,
            },
            noContentHelp: {
                type: String,
                optional: true,
            },
        },
        template: "DhtmlxGanttOtTemplate",
    });

    return patchMixin(DhtmlxGanttOtRenderer);
});
