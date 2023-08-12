odoo.define("DhtmlxGanttOtModel", function (require) {
    "use strict";

    var AbstractModel = require("web.AbstractModel");

    const DhtmlxGanttOtModel = AbstractModel.extend({
        __get: function () {
            return this.data;
        },

        __load: function (params) {
            this.modelName = params.modelName;
            this.domain = [];
            if ("domain" in params) {
                this.domain = params.domain;
            }
            this.data = {};
            return this._fetchData();
        },

        __reload: function (handle, params) {
            if ("domain" in params) {
                this.domain = params.domain;
            }
            return this._fetchData();
        },

        _fetchData: function () {
            var self = this;

            console.log("DhtmlxGanttModel = ",this.modelName);

            const model = this.modelName;
            //const model = "product.category";

            // return this._rpc({
            //     model: model,
            //     method: "search_read",
            //     limit:20,
            //     kwargs: {
            //         domain: this.domain,
            //     },
            // }).then(function (result) {
            //     self.data.items = result;
            //     console.log(result);
            // });


            //console.log("this=",this);
            //console.log(this.domain);
            //console.log(this.loadParams);
            console.log("context=",this.loadParams.context); //context des filtres dans la vue de recherche
            var vue_gantt="get_dhtmlx"

            console.log("this.loadParams.context.vue_gantt=",this.loadParams.context.vue_gantt); 



            if (this.loadParams.context.vue_gantt){
                var vue_gantt="get_dhtmlx2"
            }
            console.log("vue_gantt=",vue_gantt); 



            return this._rpc({
                model: model,
                method: vue_gantt,
                args: [1],

                //args: [JSON.parse(this.value).move_id, id],
                kwargs: {
                    domain: this.domain,
                },
            }).then(function (result) {

                console.log(result);

                self.data.items = result.items;

                //self.data.items = result.items;
                self.data.links = result.links;
            });
 



        },
    });
    return DhtmlxGanttOtModel;
});
