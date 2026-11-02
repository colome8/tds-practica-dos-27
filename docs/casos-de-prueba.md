# Diseño de casos de prueba: extensión de reservaciones

| ID | Nombre | Precondiciones | Entrada | Pasos | Resultado esperado | Tipo | Resultado obtenido |
|---|---|---|---|---|---|---|---|
| CP-01 | Extensión válida | Reservación ACTIVE, vigente y sin conflictos | Nueva hora posterior a endTime | Solicitar extensión | Actualiza endTime y responde 200 | Happy Path | Pendiente |
| CP-02 | Fecha inválida | Reservación ACTIVE y vigente | `"fecha-invalida"` | Solicitar extensión | Rechaza con 400 y no modifica la reservación | Error Case | Pendiente |
| CP-03 | Entrada que no es texto | Reservación ACTIVE y vigente | `null` | Solicitar extensión | Rechaza con 400 | Error Case | Pendiente |
| CP-04 | Hora igual a la actual | Reservación ACTIVE y vigente | Nueva hora igual a endTime | Solicitar extensión | Rechaza con 400 | Edge Case | Pendiente |
| CP-05 | Hora anterior a la actual | Reservación ACTIVE y vigente | Nueva hora menor que endTime | Solicitar extensión | Rechaza con 400 | Error Case | Pendiente |
| CP-06 | Reservación inexistente | ID válido sin reservación asociada | Nueva hora válida | Solicitar extensión | Responde 404 | Error Case | Pendiente |
| CP-07 | ID inválido | Ninguna | ID con formato incorrecto | Solicitar extensión | Responde 404 | Error Case | Pendiente |
| CP-08 | Reservación cancelada | Reservación CANCELLED | Nueva hora válida | Solicitar extensión | Rechaza con 409 | Error Case | Pendiente |
| CP-09 | Reservación terminada | endTime menor o igual al momento actual | Nueva hora futura | Solicitar extensión | Rechaza con 409 | Edge Case | Pendiente |
| CP-10 | Conflicto con otra reservación activa | Otra reservación ACTIVE comienza durante la extensión | Nueva hora posterior al inicio de la otra reservación | Solicitar extensión | Rechaza con 409 y no modifica endTime | Error Case | Pendiente |
| CP-11 | Horarios adyacentes | Otra reservación ACTIVE inicia exactamente en la nueva hora final | Nueva hora igual al inicio de la otra reservación | Solicitar extensión | Extensión permitida; responde 200 | Edge Case | Pendiente |
| CP-12 | Reservación cancelada no bloquea | Existe otra reservación CANCELLED dentro del nuevo horario | Nueva hora posterior | Solicitar extensión | Extensión permitida | Edge Case | Pendiente |
| CP-13 | No entra en conflicto consigo misma | La reservación actual aparece en las consultas del mismo espacio | Nueva hora válida | Solicitar extensión | Ignora su propio ID y actualiza correctamente | Edge Case | Pendiente |
| CP-14 | Persistencia correcta | Extensión válida | Nueva hora posterior | Extender y volver a consultar | MongoDB conserva el nuevo endTime | Happy Path | Pendiente |
| CP-15 | Actualización del Frontend | Extensión válida desde la interfaz | Nueva hora posterior | Enviar formulario | Muestra éxito y refresca reservaciones y disponibilidad | Happy Path | Pendiente |