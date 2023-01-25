import Vue from 'vue';
import Reaction, { ReactionTypes } from '../../../shared/Reaction';
import template from './TempCheck.html';
import * as Message from '../../../shared/Messages';
import './TempCheck.scss';
import { request } from '../../ClientSocket';

export const TempCheck = template(
  Vue.extend({
    props: {
      reactions: {
        default: undefined as Reaction[] | undefined,
      },
    },
    methods: {
      async react(type: ReactionTypes) {
        await request('newReactionRequest', {
          reactionType: type,
        } as Message.NewReactionRequest);
      },
      countReactions(type: ReactionTypes) {
        if (this.reactions) {
          return this.reactions.filter((reaction) => reaction.reaction == type).length;
        }
        return 0;
      },
      listNames(type: ReactionTypes) {
        if (this.reactions) {
          return this.reactions
            .filter((reaction) => reaction.reaction == type)
            .map((reaction) => reaction.user.name)
            .join(', ');
        }
        return 0;
      },
    },
  })
);
