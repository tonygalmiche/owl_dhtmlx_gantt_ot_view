from odoo import fields, models


class View(models.Model):
    _inherit = "ir.ui.view"

    type = fields.Selection(selection_add=[
        ("dhtmlx_gantt_ot", "Vue OWL Dhtmlx Gantt OT"),
    ])

