# -*- coding: utf-8 -*-
from odoo import models,fields
from datetime import datetime, timedelta
from dateutil import tz

class is_ordre_travail_line(models.Model):
    _inherit = "is.ordre.travail.line"


    def get_dhtmlx(self, domain=[]):
        LOCAL = tz.gettz('Europe/Paris')
        UTC   = tz.gettz('UTC')
        lines=self.env['is.ordre.travail.line'].search(domain)
        res=[]
        ids=[]
        for line in lines:
            if line.production_id.id not in ids:
                ids.append(line.production_id.id)
        filtre=[
            ('id','in', ids),
            ('state', 'not in', ['done', 'cancel']),
            ('is_ordre_travail_id', '!=', False),
        ]
        productions=self.env['mrp.production'].search(filtre, order="is_date_planifiee,name")
        for production in productions:
            text="%s : %s"%(production.name,(production.is_client_order_ref or '?'))

            infobulle_list=[]
            infobulle_list.append("<b>Ordre de fabrication</b>: %s"%(production.name))
            infobulle_list.append("<b>Article</b>             : %s"%(production.product_id.name))
            infobulle_list.append("<b>Commande</b>            : %s"%(production.is_sale_order_id.name))
            infobulle_list.append("<b>Référence client</b>    : %s"%(production.is_client_order_ref))
            infobulle_list.append("<b>Date client</b>         : %s"%(production.is_date_prevue.strftime('%d/%m/%y')))
            infobulle_list.append("<b>Date planifiée début</b>: %s"%(production.is_date_planifiee.strftime('%d/%m/%y')))
            infobulle_list.append("<b>Date planifiée fin</b>  : %s"%(production.is_date_planifiee_fin.strftime('%d/%m/%y')))

            #start_date_utc   = production.date_planned_start
            start_date_utc   = production.is_date_planifiee
            end_date_utc     = production.is_date_planifiee_fin

            start_date_local = start_date_utc.replace(tzinfo=UTC)
            end_date_local   = end_date_utc.replace(tzinfo=UTC)

            vals={
                "id": production.id+100000,
                "text": text,
                "start_date": start_date_local,
                "end_date": end_date_local,
                #"duration": 8, # TODO a calculer !!
                "parent": 0,
                "progress": 0,
                "open": True,
                #"assigned": project.user_id.name,
                "priority": 2,
                "infobulle": "<br>\n".join(infobulle_list)
            }
            res.append(vals)
        # #**********************************************************************

        links=[]
        return {"items":res, "links": links}


    def get_dhtmlx2(self, domain=[]):
        lines=self.env['is.ordre.travail.line'].search(domain, order="heure_debut", limit=2000)

        # #** Ajout des ordres de production **********************************
        res=[]
        productions=[]
        for line in lines:
            if line.production_id not in productions:
                productions.append(line.production_id)
        for production in productions:
            text="%s : %s"%(production.name,production.is_client_order_ref)

            infobulle_list=[]
            infobulle_list.append("<b>Ordre de fabrication</b>: %s"%(production.name))
            infobulle_list.append("<b>Article</b>             : %s"%(production.product_id.name))
            infobulle_list.append("<b>Commande</b>            : %s"%(production.is_sale_order_id.name))
            infobulle_list.append("<b>Référence client</b>    : %s"%(production.is_client_order_ref))
            infobulle_list.append("<b>Date client</b>         : %s"%(production.is_date_prevue.strftime('%d/%m/%y')))
            infobulle_list.append("<b>Date planifiée début</b>: %s"%(production.is_date_planifiee.strftime('%d/%m/%y')))
            infobulle_list.append("<b>Date planifiée fin</b>  : %s"%(production.is_date_planifiee_fin.strftime('%d/%m/%y')))

            vals={
                "id": production.id+100000,
                "text": text,
                "start_date": False,
                "duration": False,
                "parent": 0,
                "progress": 0,
                "open": True,
                #"assigned": project.user_id.name,
                "priority": 2,
                "infobulle": "<br>\n".join(infobulle_list)
            }
            res.append(vals)
        # #**********************************************************************

        #** Ajout des taches **************************************************
        for line in lines:
            end_date_utc = line.heure_fin or datetime.now()
            LOCAL = tz.gettz('Europe/Paris')
            UTC   = tz.gettz('UTC')

            #** Arrondir par pas de 30mn **************************************
            minutes = 30*round(end_date_utc.minute / 30)
            end_date_utc = end_date_utc.replace(minute=0)            # Suppression des minutes
            end_date_utc = end_date_utc + timedelta(minutes=minutes) # Ajout des minutes arrondi par pas de 15mn
            #******************************************************************

            end_date_local = end_date_utc.replace(tzinfo=UTC)
            end_date_local = end_date_local.astimezone(LOCAL)

            duration = line.duree_reelle or 4

            infobulle_list=[]
            infobulle_list.append("<b>Opération</b>           : %s"%(line.name))
            infobulle_list.append("<b>Ordre de fabrication</b>: %s"%(line.production_id.name))
            infobulle_list.append("<b>Article</b>             : %s"%(line.production_id.product_id.name))
            infobulle_list.append("<b>Commande</b>            : %s"%(line.production_id.is_sale_order_id.name))
            infobulle_list.append("<b>Référence client</b>    : %s"%(line.production_id.is_client_order_ref))
            infobulle_list.append("<b>Date client</b>         : %s"%(line.production_id.is_date_prevue))
            infobulle_list.append("<b>Poste de travail</b>    : %s"%(line.workcenter_id.name))
            infobulle_list.append("<b>Durée</b>               : %s"%(duration))
            infobulle_list.append("<b>Date de fin</b>         : %s"%(end_date_local))

            vals={
                "id": line.id,
                #"text": line.workcenter_id.name,
                "text": line.name,
                "end_date": end_date_local,
                "duration": duration,
                "parent": line.production_id.id+100000,
                #"assigned": line.user_id.name,
                #"progress": line.progress/100,
                #"priority": int(line.priority),
                "infobulle": "<br>\n".join(infobulle_list)
            }
            res.append(vals)
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
