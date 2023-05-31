# -*- coding: utf-8 -*-
from odoo import models,fields
from datetime import datetime
from dateutil import tz

class is_ordre_travail_line(models.Model):
    _inherit = "is.ordre.travail.line"

    def get_dhtmlx(self, domain=[]):
        lines=self.env['is.ordre.travail.line'].search(domain, order="ordre_id,sequence", limit=500)

        # #** Ajout des ordres de production **********************************
        res=[]
        productions=[]
        for line in lines:
            if line.production_id not in productions:
                productions.append(line.production_id)
        for production in productions:
            vals={
                "id": production.id+100000,
                "text": production.name,
                "start_date": False,
                "duration": False,
                "parent": 0,
                "progress": 0,
                "open": True,
                #"assigned": project.user_id.name,
                "priority": 2,
            }
            res.append(vals)
        # #**********************************************************************

        #** Ajout des taches **************************************************
        for line in lines:
            end_date_utc = line.heure_fin or datetime.now()
            LOCAL = tz.gettz('Europe/Paris')
            UTC   = tz.gettz('UTC')
            end_date_local = end_date_utc.replace(tzinfo=UTC)
            end_date_local = end_date_local.astimezone(LOCAL)
            duration = line.reste or 8
            vals={
                "id": line.id,
                "text": line.workcenter_id.name,
                "end_date": end_date_local,
                "duration": duration,
                "parent": line.production_id.id+100000,
                #"assigned": line.user_id.name,
                #"progress": line.progress/100,
                #"priority": int(line.priority),
                "infobulle": "duration=%s : end_date_local=%s"%(duration,end_date_local),
            }
            res.append(vals)
            #print(line.id,line.heure_fin, end_date_utc, end_date)
            print(line.id, line.heure_fin, end_date_utc, end_date_local)
        #**********************************************************************


        #** Ajout des dependances *********************************************
        links=[]
        ct=1
        mem_line=False
        mem_production=False
        for line in lines:
            if mem_production!=line.production_id:
                mem_line=False
            if mem_line:
                vals={
                    "id":ct,
                    "source": mem_line.id,
                    "target": line.id,
                    "type":0,
                }
                links.append(vals)
                ct+=1
            mem_line = line
            mem_production = line.production_id
        #**********************************************************************

        return {"items":res, "links": links}
