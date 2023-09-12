import { Op } from "sequelize";
import Dispositivo from "../models/Dispositvo";
import { Request, Response } from "express";
import Users from "../models/Users";
import Sucursal from "../models/Sucursales";
import Empresa from "../models/Empresa";
import DetalleDispositivo from "../models/DetalleComponents";
import { error } from "console";

export const GetPcYLap = async (req: Request, res: Response): Promise<void> => {
  try {
    const Data = await Dispositivo.findAll({
      where: {
        tipo: {
          [Op.in]: ["PC", "LAPTOP"],
        },
        IdUser: null,
      },
      include: [
        {
          model: Users,
        },
      ],
    });
    res.json(Data);
  } catch (error) {
    res.status(500).json({ error });
    console.log(error);
  }
};

export const CreateDisp = async (req: Request, res: Response) => {
  try {
    const { empresa, sucursal } = req.params;
    const data = req.body;

    const EmpresaBySucursal = await Sucursal.findOne({
      where: {
        nombre: sucursal,
      },
      include: [
        {
          model: Empresa,
          where: {
            nombre: empresa,
          },
        },
      ],
    });
    const EmpresaSearch: any = await Sucursal.findOne({
      where: {
        nombre: sucursal,
      },
      include: [{ model: Empresa, where: { nombre: empresa } }],
    });
    if (!EmpresaBySucursal) return res.json({ search: false });

    const { Ram_Modulos, Almacenamiento } = data;
    if (Ram_Modulos && Almacenamiento) {
      const DatosProx = {
        Ram_cantidad: Ram_Modulos.length,
        Ram_Modulos: Ram_Modulos,
        Almacenamiento_canti: Almacenamiento.length,
        Almacenamiento_detalle: Almacenamiento,
      };
      const CreateDisp: any = await Dispositivo.create({
        ...data,
        IdSucursal: EmpresaSearch?.id,
      });

      const CreatComponDisp = await DetalleDispositivo.create({
        IdDispositivo: CreateDisp.id,
        ...data,
        ...DatosProx,
      });
      if (CreateDisp && CreatComponDisp) {
        return res.json({ create: true });
      }
    }

   const respCreat:any =await Dispositivo.create({ ...data, IdSucursal: EmpresaSearch?.id });
    await DetalleDispositivo.create({...data, IdDispositivo: respCreat?.id,})
    return res.json({ create: true });

    console.log(CreateDisp);
  } catch (error) {}
};
export const GetsDispositivos = async (req: Request, res: Response) => {
  try {
    const data = req.query;
    console.log(data);
    const { empresa, sucursal } = req.query;
    if (empresa && sucursal == undefined) {
      throw new Error("Error Parametros");
    }
    console.log(empresa, sucursal);
    const Busq = await Dispositivo.findAll({
      include: [
        {
          model: DetalleDispositivo,
        },
        {
          model: Sucursal,
          where: { nombre: sucursal },
          include: [{ model: Empresa, where: { nombre: empresa } }],
        },
      ],
    });
    res.json(Busq);
  } catch (error) {
    res.json({ error });
  }
};

export const UpdateDisp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const DatsNew = req.body;

    const DataDispositivo: any = await Dispositivo.findByPk(id);
    const DataDetalleDisp: any = await DetalleDispositivo.findOne({
      where: { IdDispositivo: id },
    });
    console.log(DataDetalleDisp.id);
    const CamposUpd: any = {};
    for (const CampUpdate in DatsNew) {
      if (DataDispositivo[CampUpdate] !== DatsNew[CampUpdate]) {
        CamposUpd[CampUpdate] = DatsNew[CampUpdate];
      }
    }
    if (CamposUpd) {
      DataDispositivo.update(CamposUpd);
    }

    const Campos: any = {};
    for (const CampUpdate in DatsNew) {
      if (DataDetalleDisp[CampUpdate] !== DatsNew[CampUpdate]) {
        Campos[CampUpdate] = DatsNew[CampUpdate];
      }
    }
    DataDetalleDisp.update({
      ...Campos,
      Almacenamiento_detalle: Campos["Almacenamiento"],
    });
    return res.json({ Campos });

    // Buscar el registro en la tabla Dispositivo sin incluir modelos relacionados
    /*  const DataOld: any = await Dispositivo.findOne({
      where: {
        id,
      },
      include:[
        {model:DetalleDispositivo}
      ]
    });
    const DatosUpdate:any ={};
    for(const camposUpdate in DatsNew){

      if(DataOld[camposUpdate]!== DatsNew[camposUpdate]){
        DatosUpdate[camposUpdate]= DatsNew[camposUpdate];
      }
    }
    
    // DatosUpdate["DetalleDispositivos"][camposUpdate]=DatsNew[camposUpdate]
    function compararObjetos(obj1:any, obj2:any, busqueda:any, ruta = "") {
      for (const key in obj1) {
        if (obj2.hasOwnProperty(key)) {
          if (typeof obj1[key] === "object" && typeof obj2[key] === "object") {
            compararObjetos(obj1[key], obj2[key], busqueda, ruta + key + ".");
          } else if (obj1[key] !== obj2[key]) {
            busqueda[key] = obj1[key];
          }
        } else {
          busqueda[key] = obj1[key];
        }
      }
      return busqueda
    }
  
    const DatosUpd=compararObjetos(DatsNew , DataOld, DatosUpdate);
    console.log("datos cambiados :   "+DatosUpd)
    if (!DataOld) return res.json({ error: true, search: false,});
    return res.json({ success: true,DatosUpd });
*/
  } catch (error) {
    console.log(error);
    res.json({ error: true, message: "Error al actualizar el dispositivo" });
  }
};
export const DeleteDisp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ExistData = await Dispositivo.findOne({
      where: { id },
      include: [{ model: DetalleDispositivo }],
    });
    if (!ExistData) return res.json({ search: false });

    await Dispositivo.destroy({
      where: {
        id,
      },
    });

    res.json({ search: true });
  } catch (error) {
    res.json({ error: true, msg: error });
  }
};
export const GetsDispositivo = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    console.log(id);
    const Exist = await Dispositivo.findOne({
      where: {
        id,
      },
      include: [{ model: DetalleDispositivo }],
    });
    return res.json({ data: Exist });
  } catch (error) {}
};

export const GetsDispUsingUser = async (req: Request, res: Response) => {
  try {
    const data = req.query;
    console.log(data);
    const { empresa, sucursal } = req.query;
    const resp = await Dispositivo.findAll({
      include: [
        {
          model: Sucursal,
          where: {
            nombre: sucursal,
          },
          include: [
            {
              model: Empresa,
              where: {
                nombre: empresa,
              },
            },
          ],
        },
        {
          model: Users,
        },
      ],
    });
    res.json(resp);
  } catch (error) {
    console.log(error);
  }
};
