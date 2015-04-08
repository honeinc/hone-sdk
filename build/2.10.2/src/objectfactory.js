'use strict';

var ObjectID = require( 'bson-objectid' );

module.exports = {
    create: function( type ) {
        var creator = creators[ type ];
        if ( !creator ) {
            throw new Error( 'Unknown type: ' + type );
        }
        
        return creator();
    }
};

function _addTimestamps( obj ) {
    var now = new Date();
    obj.createdAt = obj.updatedAt = now;
    return obj;
}

var creators = {
    'auditlogentry': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            action: null,
            model: null,
            id: null,
            data: null
        } );
    },
    
    'gitHubcommit': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            branch: null,
            hash: null
        } );
    },
    
    'user': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            email: null,
            nickname: null,
            location: null,
            bio: null,
            photo: null,
            organization: null,
            organizationLink: null,
            verified: true,
            xp: 0,
            level: 1,
            sentInvites: 0,
            acceptedInvites: 0,
            admin: false,
            critic: false,
            facebook: {
                id: null
            },
            firstname: null,
            lastname: null,
            gender: null,
            birthYear: null,
            birthMonth: null,
            birthDay: null,
            phone: null,
            addressLine1: null,
            addressLine2: null,
            city: null,
            state: null,
            country: null,
            zip: null
        } );
    },
    
    'person': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            id: null,
            user: null,
            email: null,
            facebook: {
                id: null
            },
            nickname: null,
            firstname: null,
            lastname: null,
            gender: null,
            birthYear: null,
            birthMonth: null,
            birthDay: null,
            phone: null,
            geo: {
                country: null,
                region: null,
                city: null,
                addressLine1: null,
                addressLine2: null,
                location: {
                    type: null,
                    coordinates: undefined
                },
                zip: null
            },
            lastSeen: new Date()
        } );
    },
    
    'preferences': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            data: {}
        } );
    },
    
    'authtoken': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            token: null,
            capability: null,
            expires: null
        } );
    },
    
    'team': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            name: null,
            photo: null,
            members: []
        } );
    },
    
    'template': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            team: null,
            public: false,
            quiz: null,
            question: null,
            lastUsed: new Date()
        } );
    },
    
    // TODO: why plural? Why not 'Event'?
    'events': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            eventName: null,
            data: {}
        } );
    },
    
    'invite': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            email: null,
            expiresAt: null,
            acceptedAt: null
        } );
    },
    
    'question': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            team: null,
            hidden: true,
            question: null,
            description: null,
            caption: null,
            signupPitch: null,
            photo: {
                url: null,
                preview: null,
                x: null,
                y: null,
                scale: null,
                caption: null
            },
            tags: [],
            hiddenTags: [],
            agreements: [],
            startsAt: null,
            endsAt: null,
            completedAt: null,
            deletedAt: null,
            featured: false,
            css: null,
            confirmVoteExtraInfo: null,
            answered: {
                content: null,
                email: {
                    from: {
                        address: null,
                        verified: false
                    },
                    subject: null,
                    text: null,
                    html: null
                }
            },
            sharing: {
                url: null,
                content: null,
                twitter: {
                    content: null,
                    photo: null
                },
                facebook: {
                    title: null,
                    content: null,
                    photo: null
                },
                pinterest: {
                    content: null,
                    photo: null
                },
                email: {
                    content: null
                }
            },
            signupButtonText: null,
            source: null,
            curated: false,
            reward: false,
            related: [],
            allowAnonymousVotes: true,
            refreshAfterVote: false,
            logoutAfterVote: false,
            next: null,
            skipPostVote: false,
            postVoteResults: false,
            styling: {
                voteButton: {
                    background: null,
                    color: null
                },
                buyButton: {
                    background: null,
                    color: null
                },
                title: {
                    background: null,
                    color: null
                },
                itemTitle: {
                    background: null,
                    color: null
                },
                body: {
                    background: null,
                    color: null
                }
            },
            itemDetails: false,
            acceptingVotes: true,
            showCritiquesOnMainPage: false,
            showTags: false,
            postbackURL: null,
            showRelated: false,
            confirmVotes: false,
            randomizeItemOrder: false,
            gatherDemographics: false,
            requireFullUserInfo: false,
            fullUserInfoRequirementExplanation: null,
            showHeader: true,
            theme: null,
            items: [], // array of items
            template: {
                enabled: false,
                name: null,
                public: false
            },
            sponsor: {
                url: null,
                name: null,
                logo: null
            },
            quiz: null
        } );
    },
    
    'item': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            title: null,
            price: null,
            content: null,
            media: [], // array of photos
            critiques: [], // array of critiques
            tags: [],
            hiddenTags: [],
            chooseAction: null,
            link: null,
            linkAction: null,
            deletedAt: null,
            postVotePitch: null,
            next: null,
            skipPostVote: false,
            styling: {
                voteButton: {
                    background: null,
                    color: null
                },
                buyButton: {
                    background: null,
                    color: null
                },
                title: {
                    background: null,
                    color: null
                }
            },
            adItem: false
        } );
    },
    
    'photo': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            url: null,
            preview: null,
            x: null,
            y: null,
            scale: null,
            caption: null
        } );
    },
    
    'critique': function() {
        _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            content: null,
            sentiment: null
        } );
    },
    
    'quiz': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            team: null,
            title: null,
            photo: {
                url: null,
                preview: null,
                x: null,
                y: null,
                scale: null,
                caption: null
            },
            description: null,
            outcomes: [], // array of outcomes
            questions: [], // array of question references
            tags: [],
            hiddenTags: [],
            css: null,
            theme: null,
            endsAt: null,
            deletedAt: null,
            sharing: {
                content: null,
                twitter: {
                    content: null,
                    photo: null
                },
                facebook: {
                    title: null,
                    content: null,
                    photo: null
                },
                pinterest: {
                    content: null,
                    photo: null
                },
                email: {
                    content: null
                }
            },
            sponsor: {
                url: null,
                name: null,
                logo: null
            },
            template: {
                enabled: false,
                name: null,
                public: false
            },
            templateId: null,
            dataCollection: {
                form: null,
                position: -1,
                description: null,
                action: null,
                successMessage: null
            },
            conversion: null
        } );
    },

    'outcome': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            title: null,
            content: null,
            photo: null,
            caption: null,
            css: null,
            description: null,
            less: null,
            tags: [],
            sharing: {
                url: null,
                content: null,
                twitter: {
                    content: null,
                    photo: null
                },
                facebook: {
                    title: null,
                    content: null,
                    photo: null
                },
                pinterest: {
                    content: null,
                    photo: null
                },
                email: {
                    content: null
                }
            },
            sponsor: {
                url: null,
                name: null,
                logo: null
            }
        } );
    },
    
    'form': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            fields: [], // array of formfields
            title: null
        } );
    },
    
    'formfield': function() {
        return {
            _id: new ObjectID().toString(),
            name: null,
            type: 'text',
            placeholder: null,
            validation: true,
            required: true
        };
    },
    
    'datacollection': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            data: [],
            formId: null, // assoc form to see data inputs
            refId: null // this is a referance to what has created dataCollection eg. quiz/question
        } );
    },
    
    'vote': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            anonymous_id: null,
            question: null,
            item: null,
            quiz: null,
            meta: {
                gender: null,
                age: null,
                device: null,
                browser: null,
                os: null
            },
            ip: null,
            agreed: false,
            geo: {
                country: null,
                region: null,
                city: null,
                location: {
                    type: null,
                    coordinates: undefined
                },
                zip: null
            }
        } );
    },
    
    'quizvote': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            anonymous_id: null,
            votes: {}
        } );
    },
    
    'affinity': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            affinity: null,
            value: 0
        } );
    },
    
    'rewardentry': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            question: null,
            user: null,
            reason: null,
            related: {
                obj: null,
                objType: null
            }
        } );
    },
    
    'agreement': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            question: null,
            user: null,
            agreed: true
        } );
    },
    
    'socialshare': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            user: null,
            service: null,
            url: null,
            quiz: null,
            question: null,
            item: null,
            vote: null
        } );
    },
    
    'emails': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            question: null,
            items: [],
            subject: null,
            targetcount: 0,
            body: null,
            sent: 0,
            opened: 0,
            marked_spam: 0,
            rejected: 0,
            clicked: 0,
            unsubscribed: 0,
            hard_bounced: 0,
            soft_bounced: 0
        } );
    },
    
    'postback': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            quiz: null,
            question: null,
            url: null,
            result: null
        } );
    },
    
    'theme': function() {
        return _addTimestamps( {
            _id: new ObjectID().toString(),
            owner: null,
            theme_name: null,
            thumbnail: null,
            css: {
                embedded: null,
                adunit: null,
            },
            blocks: [], // array of themeblocks
            public: false,
            outcome: null,
            baseTheme: null
        } );
    },
    
    'themeblock': function() {
        return {
            _id: new ObjectID().toString(),
            type: 'embedded',
            width: null,
            height: null,
            css: ''
        };
    }
};
