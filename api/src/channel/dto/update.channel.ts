import { PartialType } from "@nestjs/mapped-types";
import { createChannelDto } from "./create.channel";

export class UpdateChannelDto extends PartialType(createChannelDto) {}