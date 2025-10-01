import {
  Count,
  CountSchema,
  Filter,
  FilterExcludingWhere,
  repository,
  Where,
} from '@loopback/repository';
import {
  post,
  param,
  get,
  getModelSchemaRef,
  patch,
  put,
  del,
  requestBody,
  response,
} from '@loopback/rest';
import {Credenciales, CredencialesCambioClave, Usuario} from '../models';
import {UsuarioRepository} from '../repositories';
import {service} from '@loopback/core';
import {AdministradorDeClavesService} from '../services';

export class UsuarioController {
  constructor(
    @repository(UsuarioRepository)
    public usuarioRepository: UsuarioRepository,
    @service(AdministradorDeClavesService)
    public servicioClaves: AdministradorDeClavesService
  ) { }

  @post('/usuarios')
  @response(200, {
    description: 'Usuario model instance',
    content: {'application/json': {schema: getModelSchemaRef(Usuario)}},
  })
  async create(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {
            title: 'NewUsuario',
            exclude: ['_id'],
          }),
        },
      },
    })
    usuario: Omit<Usuario, '_id'>,
  ): Promise<Usuario> {
    let clave = this.servicioClaves.generarClaveAleatoria();
    usuario.clave = this.servicioClaves.cibrarTexto(clave);

    return this.usuarioRepository.create(usuario);
  }

  @get('/usuarios/count')
  @response(200, {
    description: 'Usuario model count',
    content: {'application/json': {schema: CountSchema}},
  })
  async count(
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.count(where);
  }

  @get('/usuarios')
  @response(200, {
    description: 'Array of Usuario model instances',
    content: {
      'application/json': {
        schema: {
          type: 'array',
          items: getModelSchemaRef(Usuario, {includeRelations: true}),
        },
      },
    },
  })
  async find(
    @param.filter(Usuario) filter?: Filter<Usuario>,
  ): Promise<Usuario[]> {
    return this.usuarioRepository.find(filter);
  }

  @patch('/usuarios')
  @response(200, {
    description: 'Usuario PATCH success count',
    content: {'application/json': {schema: CountSchema}},
  })
  async updateAll(
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
    @param.where(Usuario) where?: Where<Usuario>,
  ): Promise<Count> {
    return this.usuarioRepository.updateAll(usuario, where);
  }

  @get('/usuarios/{_id}')
  @response(200, {
    description: 'Usuario model instance',
    content: {
      'application/json': {
        schema: getModelSchemaRef(Usuario, {includeRelations: true}),
      },
    },
  })
  async findById(
    @param.path.string('_id') _id: string,
    @param.filter(Usuario, {exclude: 'where'}) filter?: FilterExcludingWhere<Usuario>
  ): Promise<Usuario> {
    return this.usuarioRepository.findById(_id, filter);
  }

  @patch('/usuarios/{_id}')
  @response(204, {
    description: 'Usuario PATCH success',
  })
  async updateById(
    @param.path.string('_id') _id: string,
    @requestBody({
      content: {
        'application/json': {
          schema: getModelSchemaRef(Usuario, {partial: true}),
        },
      },
    })
    usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.updateById(_id, usuario);
  }

  @put('/usuarios/{_id}')
  @response(204, {
    description: 'Usuario PUT success',
  })
  async replaceById(
    @param.path.string('_id') _id: string,
    @requestBody() usuario: Usuario,
  ): Promise<void> {
    await this.usuarioRepository.replaceById(_id, usuario);
  }

  @del('/usuarios/{_id}')
  @response(204, {
    description: 'Usuario DELETE success',
  })
  async deleteById(@param.path.string('_id') _id: string): Promise<void> {
    await this.usuarioRepository.deleteById(_id);
  }

  /*
  *Seccion de seguridad
  */

  @post("/identificar-usuario")
  @response(200, {
    description: 'Identificacion de usuarios'
  })
  async identificar(@requestBody() credenciales: Credenciales): Promise<Usuario | null> {

    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: credenciales.correo,
        clave: credenciales.clave
      }

    });

    return usuario;
  }
  @post("/recuperar-clave")
  @response(200, {
    description: "Recuperacion de clave del usuario"
  })
  async recuperarClave(@requestBody() correo: string): Promise<Boolean> {

    let usuario = await this.usuarioRepository.findOne({
      where: {
        correo: correo
      }
    });
    if (usuario!=null) {

      let clave= this.servicioClaves.generarClaveAleatoria();
      let claveCifrada = this.servicioClaves.cibrarTexto(clave);
      usuario.clave=claveCifrada;
      await this.usuarioRepository.updateById(usuario._id,usuario);
      return true;

    }
    return false;

  }
   @post("/cambiar-clave")
  @response(200, {
    description: "Cambio de clave del usuario"
  })
  async cambiarClave(@requestBody() credenciales : CredencialesCambioClave): Promise<Boolean> {

    let usuario = await this.usuarioRepository.findOne({
      where: {
        _id: credenciales.id,
        clave:credenciales.clave_actual
      }
    });
    if (usuario!=null) {
      console.log(credenciales.nueva_clave);
      let claveCifrada = this.servicioClaves.cibrarTexto(credenciales.nueva_clave);
      usuario.clave=claveCifrada;
       console.log(claveCifrada);

      await this.usuarioRepository.updateById(usuario._id,usuario);
      //se cambia la contrasenya
      return true;

    }
    return false;

  }



}
