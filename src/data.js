function Data () {
    const dado = {
        eventos: []
    }
    
    const setEventos = (e) => {
        dado.eventos = e
    }

    const getEventos = (e) => {
        return dado.eventos
    }

    return {
        dado,
        setEventos,
        getEventos
    }
}

export default Data
