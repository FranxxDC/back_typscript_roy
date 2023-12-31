
import { CreateDisp, DeleteDisp, GetPcYLap, GetsDispUsingUser, GetsDispositivo, GetsDispositivos, UpdateDisp } from "../controller/Dispositivos.controller";
import {  Router } from "express";
const DispostivoRoutes = Router()

DispostivoRoutes.get('/',GetsDispositivos)
DispostivoRoutes.get('/Users',GetsDispUsingUser)
DispostivoRoutes.get('/:id',GetsDispositivo)
DispostivoRoutes.get('/PCLAP',GetPcYLap)
DispostivoRoutes.post('/:empresa/:sucursal',CreateDisp)
DispostivoRoutes.put('/:id',UpdateDisp)
DispostivoRoutes.delete('/:id',DeleteDisp)



export default DispostivoRoutes;