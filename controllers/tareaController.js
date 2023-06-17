import Tarea from "../models/Tarea.js";
import Proyecto from "../models/Proyecto.js"

const agregarTarea = async (req, res) => {

    const { proyecto } = req.body
    const existeProyecto = await Proyecto.findById(proyecto)

    if (!existeProyecto) {
        const error = new Error("El proyecto no existe")
        return res.status(404).json({ msg: error.message })
    }

    if (existeProyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("No tienes los permisos para añadir tareas")
        return res.status(404).json({ msg: error.message })
    }

    try {
        const tareaAlmacenada = await Tarea.create(req.body)

        //Almacenar el ID en el proyecto
        existeProyecto.tareas.push(tareaAlmacenada._id)
        await existeProyecto.save()

        return res.status(200).json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const obtenerTarea = async (req, res) => {

    const { id } = req.params
    const tarea = await Tarea.findById(id).populate("proyecto")

    if (!tarea) {
        const error = new Error("Tarea no existe")
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion no valida")
        return res.status(403).json({ msg: error.message })
    }

    try {

        return res.status(200).json(tarea)
    } catch (error) {
        console.log(error)
    }
}

const actualizarTarea = async (req, res) => {

    const { id } = req.params
    const tarea = await Tarea.findById(id).populate("proyecto")

    if (!tarea) {
        const error = new Error("Tarea no existe")
        return res.status(404).json({ msg: error.message })
    }

    if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion no valida")
        return res.status(403).json({ msg: error.message })
    }

    const { nombre, descripcion, fechaEntrega, prioridad } = req.body

    tarea.nombre = nombre || tarea.nombre
    tarea.descripcion = descripcion || tarea.descripcion
    tarea.fechaEntrega = fechaEntrega || tarea.fechaEntrega
    tarea.prioridad = prioridad || tarea.prioridad

    try {
        const tareaAlmacenada = await tarea.save()
        return res.status(200).json(tareaAlmacenada)
    } catch (error) {
        console.log(error)
    }
}

const eliminarTarea = async (req, res) => {

    const { id } = req.params

    try {
        const tarea = await Tarea.findById(id).populate("proyecto")

        if (!tarea) {
            const error = new Error("Tarea no existe")
            return res.status(404).json({ msg: error.message })
        }

        if (tarea.proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("Accion no valida")
            return res.status(403).json({ msg: error.message })
        }

        const proyecto = await Proyecto.findById(tarea.proyecto)
        proyecto.tareas.pull(tarea._id)

        // await proyecto.save()
        // await tarea.deleteOne()
        //En lugar de hacer dos consultas se pueden hacer simulaneamente con la sigueinte linea
        await Promise.allSettled([await proyecto.save(), await tarea.deleteOne()])

        return res.status(200).json({ msg: "Tarea Eliminada exitosamente" })
    } catch (error) {
        console.log(error)
    }
}

const cambiarEstado = async (req, res) => {

    const { id } = req.params
    try {
        const tarea = await Tarea.findById(id)
            .populate("proyecto")

        if (!tarea) {
            const error = new Error("Tarea no existe")
            return res.status(404).json({ msg: error.message })
        }
        if ((tarea.proyecto.creador.toString() !== req.usuario._id.toString()) && (!tarea.proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()))) {
            const error = new Error("Accion no valida")
            return res.status(403).json({ msg: error.message })
        }

        tarea.estado = !tarea.estado
        tarea.completado = req.usuario._id

        await tarea.save()

        const tareaAlmacenada = await Tarea.findById(id)
            .populate("proyecto")
            .populate("completado")

        res.status(200).json(tareaAlmacenada)

    } catch (error) {
        console.log(error)
    }
}

export {
    agregarTarea,
    obtenerTarea,
    actualizarTarea,
    eliminarTarea,
    cambiarEstado
}