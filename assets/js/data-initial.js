// Datos iniciales para las páginas que cargan scripts normales (sin módulos).
// El inventario se guarda una sola vez; después se lee siempre de localStorage.
window.LIBROS_TIENDA = [
    { id: 101, titulo: "Drácula", autor: "Bram Stoker", precio: 35000, stock: 8, isbn: "9788415618836", categoria: "Terror", encuadernacion: "Dura", estado: "Bueno", descripcion: "Clásico del terror gótico ambientado en Transilvania e Inglaterra." },
    { id: 102, titulo: "Harry Potter y la piedra filosofal", autor: "J. K. Rowling", precio: 50000, stock: 10, isbn: "9788478884452", categoria: "Fantasía", encuadernacion: "Blanda", estado: "Bueno", descripcion: "El inicio del joven mago en el Colegio Hogwarts de Magia y Hechicería." },
    { id: 103, titulo: "Breves respuestas a las grandes preguntas", autor: "Stephen Hawking", precio: 42000, stock: 6, isbn: "9788491990437", categoria: "Ciencia", encuadernacion: "Dura", estado: "Excelente", descripcion: "Reflexiones sobre el universo y el futuro de la humanidad." },
    { id: 104, titulo: "Veinte poemas de amor y una canción desesperada", autor: "Pablo Neruda", precio: 25000, stock: 7, isbn: "9788437604947", categoria: "Poesía", encuadernacion: "Blanda", estado: "Bueno", descripcion: "Una obra reconocida de la poesía amorosa en lengua castellana." },
    { id: 105, titulo: "Orgullo y prejuicio", autor: "Jane Austen", precio: 38000, stock: 9, isbn: "9788491050292", categoria: "Romance", encuadernacion: "Dura", estado: "Excelente", descripcion: "Una historia sobre las apariencias, el amor y los prejuicios sociales." },
    { id: 106, titulo: "Sapiens: De animales a dioses", autor: "Yuval Noah Harari", precio: 60000, stock: 5, isbn: "9788499924212", categoria: "Historia", encuadernacion: "Dura", estado: "Excelente", descripcion: "Un recorrido por la historia y evolución de nuestra especie." },
    { id: 107, titulo: "Mi historia", autor: "Michelle Obama", precio: 47000, stock: 4, isbn: "9788401021282", categoria: "Biografía", encuadernacion: "Blanda", estado: "Bueno", descripcion: "Memorias y reflexiones de la ex primera dama de los Estados Unidos." },
    { id: 108, titulo: "El principito", autor: "Antoine de Saint-Exupéry", precio: 30000, stock: 15, isbn: "9788498381498", categoria: "Infantil", encuadernacion: "Dura", estado: "Excelente", descripcion: "Relato poético e ilustrado sobre la inocencia, el amor y la amistad." },
    { id: 109, titulo: "Hábitos atómicos", autor: "James Clear", precio: 55000, stock: 12, isbn: "9788418118036", categoria: "Autoayuda", encuadernacion: "Blanda", estado: "Excelente", descripcion: "Guía práctica para conseguir cambios mediante pequeños hábitos." },
    { id: 110, titulo: "Padre rico, padre pobre", autor: "Robert T. Kiyosaki", precio: 40000, stock: 11, isbn: "9788403522121", categoria: "Economía", encuadernacion: "Dura", estado: "Bueno", descripcion: "Lecciones sobre educación financiera y mentalidad de crecimiento." },
    { id: 1, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", precio: 45000, stock: 12, isbn: "9788420471839", categoria: "Novela clásica", encuadernacion: "Dura", estado: "Excelente", descripcion: "Obra del realismo mágico sobre la familia Buendía en Macondo." },
    { id: 2, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", precio: 65000, stock: 8, isbn: "9788424116040", categoria: "Novela clásica", encuadernacion: "Dura", estado: "Bueno", descripcion: "Las inolvidables andanzas del hidalgo de la literatura universal." },
    { id: 3, titulo: "Los tres mosqueteros", autor: "Alexandre Dumas", precio: 48000, stock: 0, isbn: "9788497592208", categoria: "Novela clásica", encuadernacion: "Blanda", estado: "Aceptable", descripcion: "Aventuras, honor y camaradería en la Francia del siglo XVII." },
    { id: 4, titulo: "El señor de los anillos", autor: "J. R. R. Tolkien", precio: 85000, stock: 5, isbn: "9788445071403", categoria: "Fantasía", encuadernacion: "Dura", estado: "Excelente", descripcion: "La gran epopeya de la Tierra Media y el viaje para destruir el Anillo Único." },
    // Otros ejemplares de las mismas ediciones en distinto estado (cada fila = un estado).
    { id: 111, titulo: "Drácula", autor: "Bram Stoker", precio: 35000, stock: 3, isbn: "9788415618836", categoria: "Terror", encuadernacion: "Dura", estado: "Excelente", descripcion: "Clásico del terror gótico ambientado en Transilvania e Inglaterra." },
    { id: 112, titulo: "Drácula", autor: "Bram Stoker", precio: 35000, stock: 2, isbn: "9788415618836", categoria: "Terror", encuadernacion: "Dura", estado: "Aceptable", descripcion: "Clásico del terror gótico ambientado en Transilvania e Inglaterra." },
    { id: 113, titulo: "Harry Potter y la piedra filosofal", autor: "J. K. Rowling", precio: 50000, stock: 4, isbn: "9788478884452", categoria: "Fantasía", encuadernacion: "Blanda", estado: "Excelente", descripcion: "El inicio del joven mago en el Colegio Hogwarts de Magia y Hechicería." },
    { id: 114, titulo: "Harry Potter y la piedra filosofal", autor: "J. K. Rowling", precio: 50000, stock: 3, isbn: "9788478884452", categoria: "Fantasía", encuadernacion: "Blanda", estado: "Aceptable", descripcion: "El inicio del joven mago en el Colegio Hogwarts de Magia y Hechicería." },
    { id: 115, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", precio: 45000, stock: 5, isbn: "9788420471839", categoria: "Novela clásica", encuadernacion: "Dura", estado: "Bueno", descripcion: "Obra del realismo mágico sobre la familia Buendía en Macondo." },
    { id: 116, titulo: "Cien años de soledad", autor: "Gabriel García Márquez", precio: 45000, stock: 2, isbn: "9788420471839", categoria: "Novela clásica", encuadernacion: "Dura", estado: "Aceptable", descripcion: "Obra del realismo mágico sobre la familia Buendía en Macondo." },
    { id: 117, titulo: "Don Quijote de la Mancha", autor: "Miguel de Cervantes", precio: 65000, stock: 3, isbn: "9788424116040", categoria: "Novela clásica", encuadernacion: "Dura", estado: "Aceptable", descripcion: "Las inolvidables andanzas del hidalgo de la literatura universal." },
    { id: 118, titulo: "Los tres mosqueteros", autor: "Alexandre Dumas", precio: 48000, stock: 2, isbn: "9788497592208", categoria: "Novela clásica", encuadernacion: "Blanda", estado: "Bueno", descripcion: "Aventuras, honor y camaradería en la Francia del siglo XVII." }
];

// Recibe una clave y un valor de reserva; devuelve los datos guardados o la reserva.
window.leerDatosTienda = function (clave, reserva) {
    const texto = localStorage.getItem(clave);
    if (texto === null) {
        return reserva;
    }
    return JSON.parse(texto);
};

// Migración única y SIN borrar nada: conserva los libros que ya existen (incluidos los
// creados desde el administrador y el carrito) y solo agrega los ejemplares de ejemplo
// que falten. Un libro de ejemplo se omite si su id o su edición+estado ya existen.
if (localStorage.getItem("paginas_catalogo_estados_v1") === null) {
    const guardados = window.leerDatosTienda("paginas_libros_v4", null);
    if (guardados !== null) {
        for (let i = 0; i < window.LIBROS_TIENDA.length; i = i + 1) {
            const nuevo = window.LIBROS_TIENDA[i];
            let existe = false;
            for (let j = 0; j < guardados.length; j = j + 1) {
                const mismoId = String(guardados[j].id) === String(nuevo.id);
                const mismaFila = guardados[j].isbn === nuevo.isbn
                    && guardados[j].encuadernacion === nuevo.encuadernacion
                    && guardados[j].estado === nuevo.estado;
                if (mismoId || mismaFila) {
                    existe = true;
                }
            }
            if (!existe) {
                guardados.push(nuevo);
            }
        }
        localStorage.setItem("paginas_libros_v4", JSON.stringify(guardados));
    }
    localStorage.setItem("paginas_catalogo_estados_v1", "si");
}

if (localStorage.getItem("paginas_libros_v4") === null) {
    localStorage.setItem("paginas_libros_v4", JSON.stringify(window.LIBROS_TIENDA));
}
