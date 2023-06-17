import Proyecto from "../models/Proyecto.js"
import Tarea from "../models/Tarea.js"
import Usuario from "../models/Usuario.js"

const obtenerProyectos = async (req, res) => {
    try {
        const proyectos = await Proyecto.find({
            $or: [
                { creador: { $in: req.usuario } },
                { colaboradores: { $in: req.usuario } }
            ]
        }).select('-tareas')

        res.json(proyectos)

    } catch (error) {
        console.log(error)
    }
}

const nuevoProyecto = async (req, res) => {

    const proyecto = new Proyecto(req.body)
    proyecto.creador = req.usuario._id

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }
}

const obtenerProyecto = async (req, res) => {
    const { id } = req.params

    try {
        const proyecto = await Proyecto.findById(id)
            .populate({
                path: "tareas",
                populate: { path: "completado", select: "nombre" },
            })
            .populate("colaboradores", "nombre email")

        if (!proyecto) {
            const error = new Error("Proyecto no encontrado")
            return res.status(404).json({ msg: error.message })
        }

        if ((proyecto.creador.toString() !== req.usuario._id.toString()) && (!proyecto.colaboradores.some(colaborador => colaborador._id.toString() === req.usuario._id.toString()))) {
            const error = new Error("Accion No Valida")
            return res.status(401).json({ msg: error.message })
        }

        res.status(200).json(proyecto)

    } catch (error) {
        return res.status(404).json({ msg: "Proyecto no encontrado" })
    }
}

const editarProyecto = async (req, res) => {

    const { id } = req.params
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion No Valida")
        return res.status(401).json({ msg: error.message })
    }

    proyecto.nombre = req.body.nombre || proyecto.nombre
    proyecto.descripcion = req.body.descripcion || proyecto.descripcion
    proyecto.fechaEntrega = req.body.fechaEntrega || proyecto.fechaEntrega
    proyecto.cliente = req.body.cliente || proyecto.cliente

    try {
        const proyectoAlmacenado = await proyecto.save()
        res.json(proyectoAlmacenado)
    } catch (error) {
        console.log(error)
    }

}

const eliminarProyecto = async (req, res) => {

    const { id } = req.params
    const proyecto = await Proyecto.findById(id)

    if (!proyecto) {
        const error = new Error("Proyecto no encontrado")
        return res.status(404).json({ msg: error.message })
    }

    if (proyecto.creador.toString() !== req.usuario._id.toString()) {
        const error = new Error("Accion No Valida")
        return res.status(401).json({ msg: error.message })
    }

    try {
        await proyecto.deleteOne()
        res.status(200).json({ msg: "Proyecto Eliminado" })
    } catch (error) {
        console.log(error)
    }

}

const buscarColaborador = async (req, res) => {

    const { email } = req.body

    try {
        if (!email) {
            const error = new Error("El email es obligatorio")
            return res.status(404).json({ msg: error.message })
        }

        const usuario = await Usuario.findOne({ email }).select('-password -token -createdAt -updatedAt -__v')

        if (!usuario) {
            const error = new Error("Usuario no encontrado")
            return res.status(404).json({ msg: error.message })
        }

        // Comprobar si es usuario confirmado
        if (!usuario.confirmado) {
            const error = new Error("Tu cuenta no ha sido confirmada")
            return res.status(403).json({ msg: error.message })
        }

        //delete usuario.confirmado
        res.status(200).json(usuario)

    } catch (error) {
        console.log(error)
    }
}

const agregarColaborador = async (req, res) => {
    const { email } = req.body
    const { id } = req.params

    try {
        const proyecto = await Proyecto.findById(id)

        //Comprueba que el proyecto exista
        if (!proyecto) {
            const error = new Error("Proyecto no encontrado")
            return res.status(404).json({ msg: error.message })
        }

        //Comprueba que el creador sea quien esta agregando colaboradores
        if (proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("Accion no valida")
            return res.status(403).json({ msg: error.message })
        }

        if (!email) {
            const error = new Error("El email es obligatorio")
            return res.status(404).json({ msg: error.message })
        }

        const usuario = await Usuario.findOne({ email }).select('-password -token -createdAt -updatedAt -__v')

        if (!usuario) {
            const error = new Error("Usuario no encontrado")
            return res.status(404).json({ msg: error.message })
        }

        // Comprobar si es usuario confirmado
        if (!usuario.confirmado) {
            const error = new Error("Esta cuenta no ha sido confirmada")
            return res.status(403).json({ msg: error.message })
        }

        //El colaborador no es el admin del proyecto
        if (proyecto.creador.toString() === usuario._id.toString()) {
            const error = new Error("El creador del proyecto no puede ser colaborador")
            return res.status(403).json({ msg: error.message })
        }

        //Revisar que no este ya agregado al proyecto
        if (proyecto.colaboradores.includes(usuario._id)) {
            const error = new Error("El usuario ya pertenece al proyecto")
            return res.status(403).json({ msg: error.message })
        }

        proyecto.colaboradores.push(usuario._id)
        await proyecto.save()

        res.status(200).json({ msg: "Colaborador Agregado Correctamente" })

    } catch (error) {
        console.log(error)
    }
}

const eliminarColaborador = async (req, res) => {

    const { id } = req.params

    try {
        const proyecto = await Proyecto.findById(id)

        //Comprueba que el proyecto exista
        if (!proyecto) {
            const error = new Error("Proyecto no encontrado")
            return res.status(404).json({ msg: error.message })
        }

        //Comprueba que el creador sea quien esta agregando colaboradores
        if (proyecto.creador.toString() !== req.usuario._id.toString()) {
            const error = new Error("Accion no valida")
            return res.status(403).json({ msg: error.message })
        }

        proyecto.colaboradores.pull(req.body.id)
        await proyecto.save()

        res.status(200).json({ msg: "Colaborador Eliminado Correctamente" })

    } catch (error) {
        console.log(error)
    }
}


export {
    obtenerProyectos,
    nuevoProyecto,
    obtenerProyecto,
    editarProyecto,
    eliminarProyecto,
    buscarColaborador,
    agregarColaborador,
    eliminarColaborador

}