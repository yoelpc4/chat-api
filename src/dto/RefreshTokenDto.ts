import { Expose } from 'class-transformer'

export default class RefreshTokenDto {
  @Expose()
  token!: string
}
