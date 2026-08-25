import type { Schema, Struct } from '@strapi/strapi';

export interface SharedFaqItem extends Struct.ComponentSchema {
  collectionName: 'components_shared_faq_items';
  info: {
    description: 'Question and answer pair';
    displayName: 'FAQ item';
  };
  attributes: {
    answer: Schema.Attribute.Blocks;
    question: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedFeature extends Struct.ComponentSchema {
  collectionName: 'components_shared_features';
  info: {
    description: 'Home features grid item';
    displayName: 'Feature';
  };
  attributes: {
    description: Schema.Attribute.Text;
    icon: Schema.Attribute.Enumeration<
      ['truck', 'shield', 'tag', 'heart', 'box', 'zap']
    > &
      Schema.Attribute.DefaultTo<'box'>;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedJob extends Struct.ComponentSchema {
  collectionName: 'components_shared_jobs';
  info: {
    description: 'Job opening';
    displayName: 'Job';
  };
  attributes: {
    description: Schema.Attribute.Text;
    location: Schema.Attribute.String;
    title: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedMethod extends Struct.ComponentSchema {
  collectionName: 'components_shared_methods';
  info: {
    description: 'Shipping option';
    displayName: 'Shipping Method';
  };
  attributes: {
    description: Schema.Attribute.Text;
    name: Schema.Attribute.String & Schema.Attribute.Required;
    price: Schema.Attribute.String;
  };
}

export interface SharedNote extends Struct.ComponentSchema {
  collectionName: 'components_shared_notes';
  info: {
    description: 'Simple text note (steps, policies, bullets)';
    displayName: 'Note';
  };
  attributes: {
    text: Schema.Attribute.Text & Schema.Attribute.Required;
  };
}

export interface SharedRichText extends Struct.ComponentSchema {
  collectionName: 'components_shared_rich_texts';
  info: {
    description: 'Rich text block (Strapi blocks format)';
    displayName: 'Rich text';
  };
  attributes: {
    content: Schema.Attribute.Blocks;
  };
}

export interface SharedSocialLink extends Struct.ComponentSchema {
  collectionName: 'components_shared_social_links';
  info: {
    description: 'Social network link for the footer';
    displayName: 'Social Link';
  };
  attributes: {
    platform: Schema.Attribute.Enumeration<
      [
        'facebook',
        'twitter',
        'instagram',
        'linkedin',
        'youtube',
        'tiktok',
        'whatsapp',
      ]
    > &
      Schema.Attribute.Required;
    url: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedStat extends Struct.ComponentSchema {
  collectionName: 'components_shared_stats';
  info: {
    description: 'Stat card (label + value)';
    displayName: 'Stat';
  };
  attributes: {
    label: Schema.Attribute.String & Schema.Attribute.Required;
    value: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface SharedTier extends Struct.ComponentSchema {
  collectionName: 'components_shared_tiers';
  info: {
    description: 'Shipping rate tier';
    displayName: 'Rate Tier';
  };
  attributes: {
    description: Schema.Attribute.Text;
    label: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

declare module '@strapi/strapi' {
  export namespace Public {
    export interface ComponentSchemas {
      'shared.faq-item': SharedFaqItem;
      'shared.feature': SharedFeature;
      'shared.job': SharedJob;
      'shared.method': SharedMethod;
      'shared.note': SharedNote;
      'shared.rich-text': SharedRichText;
      'shared.social-link': SharedSocialLink;
      'shared.stat': SharedStat;
      'shared.tier': SharedTier;
    }
  }
}
