import {
  repository,
} from '@loopback/repository';
import {
  param,
  get,
  getModelSchemaRef,
} from '@loopback/rest';
import {
  Usuario,
  Rol,
} from '../models';
import {UsuarioRepository} from '../repositories';

export class UsuarioRolController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
  ) { }

  @get('/usuarios/{_id}/rol', {
    responses: {
      '200': {
        description: 'Rol belonging to Usuario',
        content: {
          'application/json': {
            schema: getModelSchemaRef(Rol),
          },
        },
      },
    },
  })
  async getRol(
    @param.path.string('_id') _id: typeof Usuario.prototype._id,
  ): Promise<Rol> {
    return this.usuarioRepository.tiene(_id);
  }
}
