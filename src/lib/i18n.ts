import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const pairs = `
locale¦fr-FR
Customer and campaign must belong to the same client¦Le client final et la campagne doivent appartenir au même client
Overview¦Vue d’ensemble
Clients¦Clients
Client¦Client
Campaigns¦Campagnes
Campaign¦Campagne
Customers & leads¦Clients finaux et prospects
Customer¦Client final
Customers¦Clients finaux
Lead¦Prospect
Calls¦Appels
Call¦Appel
Tasks¦Tâches
Task¦Tâche
Follow-ups¦Suivis
Follow-up¦Suivi
Tickets¦Tickets
Ticket¦Ticket
Automation¦Automatisation
Automation rule¦Règle d’automatisation
Employees¦Collaborateurs
Employee¦Collaborateur
Quality assurance¦Assurance qualité
Reports & analytics¦Rapports et analyses
Notifications¦Notifications
Language hub¦Espace linguistique
Settings¦Paramètres
Evaluations¦Évaluations
Evaluation¦Évaluation
Communication templates¦Modèles de communication
Template¦Modèle
Knowledge base¦Base de connaissances
Article¦Article
WORKSPACE¦ESPACE DE TRAVAIL
Workspace¦Espace de travail
OPERATIONS¦OPÉRATIONS
BUSINESS¦ACTIVITÉ
PEOPLE¦ÉQUIPE
PEOPLE & INSIGHTS¦ÉQUIPE ET ANALYSES
ADMINISTRATION¦ADMINISTRATION
Main workspace¦Espace principal
Enterprise demo¦Démo entreprise
Main navigation¦Navigation principale
Ready for a walkthrough?¦Envie d’une visite guidée ?
Explore the demo workflow¦Découvrir le parcours de démo
Collapse sidebar¦Réduire le menu
Expand sidebar¦Développer le menu
Open menu¦Ouvrir le menu
Close menu¦Fermer le menu
Skip to content¦Aller au contenu
Search anything...¦Rechercher...
Interface language¦Langue de l’interface
Super Admin¦Super Admin
Super Admin profile¦Profil Super Admin
Full access¦Accès complet
Workspace settings¦Paramètres de l’espace
One preselected demonstration account with access to every module and action.¦Un compte de démonstration présélectionné avec accès à tous les modules et actions.
Search your workspace¦Rechercher dans l’espace
Global search¦Recherche globale
Search customers, tickets, campaigns...¦Rechercher des clients, tickets, campagnes...
Type to search across all modules.¦Saisissez du texte pour rechercher dans tous les modules.
Your demo walkthrough¦Votre parcours de démonstration
A complete customer support journey in one workspace.¦Un parcours d’assistance client complet dans un seul espace.
Identify or create a customer¦Identifier ou créer un client
Assign by preferred language¦Attribuer selon la langue préférée
Simulate a customer call¦Simuler un appel client
Create, resolve or escalate a ticket¦Créer, résoudre ou escalader un ticket
Schedule the next conversation¦Planifier la prochaine conversation
Evaluate and coach¦Évaluer et accompagner
Review the operational results¦Consulter les résultats opérationnels
All integrations are simulated. Changes persist locally.¦Toutes les intégrations sont simulées. Les modifications sont conservées localement.
YOUR OPERATIONS, CONNECTED¦VOS OPÉRATIONS, CONNECTÉES
A good day starts with clarity.¦Une journée sous le signe de la clarté.
Here’s what’s happening across your workspace.¦Voici ce qui se passe dans votre espace de travail.
Operational overview¦Vue opérationnelle
Total customers¦Total des clients
Across your campaigns¦Dans vos campagnes
Conversations¦Conversations
Customer calls recorded¦Appels clients enregistrés
Open tickets¦Tickets ouverts
Unresolved¦Non résolus
Ready for your attention¦À traiter par votre équipe
Quality score¦Score qualité
Average evaluated score¦Moyenne des évaluations
Conversation activity¦Activité des conversations
Customer touchpoints over the last 7 days¦Interactions clients sur les 7 derniers jours
Inbound conversations¦Conversations entrantes
Resolved tickets¦Tickets résolus
Tasks completed¦Tâches terminées
TODAY’S FOCUS¦PRIORITÉS DU JOUR
Small actions. Better experiences.¦Chaque action compte.
Keep your team moving by clearing the work that needs you most.¦Aidez votre équipe à avancer en traitant les activités prioritaires.
Overdue follow-ups¦Suivis en retard
Escalated tickets¦Tickets escaladés
Review pending work¦Consulter le travail en attente
Your priority queue¦Vos activités prioritaires
The next steps that make a difference¦Les prochaines actions qui font la différence
View all¦Tout voir
People behind the progress¦Les acteurs de votre réussite
Team activity in your selected scope¦Activité des équipes dans le périmètre sélectionné
View reports¦Voir les rapports
interactions¦interactions
clients¦clients
campaigns¦campagnes
Meet your team¦Voir votre équipe
All systems simulated¦Tous les systèmes sont simulés
Data saved on this device¦Données enregistrées sur cet appareil
SUPER ADMIN WORKSPACE¦ESPACE SUPER ADMIN
All caught up¦Tout est à jour
There is no pending work for these filters.¦Aucune activité en attente pour ces filtres.
Name¦Nom
Industry¦Secteur
Email¦E-mail
Phone¦Téléphone
Contact persons¦Personnes de contact
Contract reference¦Référence du contrat
Contract start¦Début du contrat
Contract end¦Fin du contrat
Service requirements¦Exigences de service
Team¦Équipe
Notes¦Notes
Assigned employees¦Collaborateurs affectés
Monthly interaction target¦Objectif mensuel d’interactions
Progress (%)¦Progression (%)
Progress¦Progression
Workflow stages¦Étapes du processus
Start date¦Date de début
End date¦Date de fin
Language¦Langue
Assigned employee¦Collaborateur affecté
Record type¦Type de fiche
Company¦Entreprise
Follow-up requirements¦Besoins de suivi
Direction¦Direction
Disposition¦Motif de clôture
Duration (seconds)¦Durée (secondes)
Duration¦Durée
Priority¦Priorité
Due date¦Échéance
Description¦Description
Channel¦Canal
Outcome¦Résultat
Category¦Catégorie
Resolution¦Résolution
Sample attachments¦Pièces jointes de démonstration
Trigger¦Déclencheur
Condition¦Condition
Action¦Action
Target employee¦Collaborateur cible
Role¦Rôle
Department¦Département
Departments¦Départements
Supervisor¦Superviseur
Language proficiency¦Compétences linguistiques
Campaign assignments¦Affectations aux campagnes
Additional permissions¦Autorisations supplémentaires
Score¦Score
Feedback¦Commentaires
English content¦Contenu anglais
French content¦Contenu français
Status¦Statut
English¦Anglais
French¦Français
English & French¦Anglais et français
Active¦Actif
Inactive¦Inactif
Planning¦Planification
Paused¦En pause
Completed¦Terminé
New¦Nouveau
Contacted¦Contacté
Qualified¦Qualifié
Closed¦Clôturé
Missed¦Manqué
Cancelled¦Annulé
To do¦À faire
In progress¦En cours
Review¦En revue
Scheduled¦Planifié
Open¦Ouvert
Escalated¦Escaladé
Resolved¦Résolu
Low¦Faible
Medium¦Moyenne
High¦Élevée
Urgent¦Urgente
Incoming¦Entrant
Outgoing¦Sortant
Follow-up needed¦Suivi nécessaire
No answer¦Sans réponse
Billing¦Facturation
Technical¦Technique
General¦Général
Complaint¦Réclamation
Operations Manager¦Responsable des opérations
Agent¦Agent
Quality Analyst¦Analyste qualité
Account Manager¦Responsable de compte
Operations¦Opérations
Quality¦Qualité
Client Services¦Services clients
Ticket created¦Ticket créé
Task created¦Tâche créée
Follow-up due¦Suivi à échéance
Any record¦Toute fiche
French language¦Langue française
High priority¦Priorité élevée
Overdue¦En retard
Assign employee¦Affecter un collaborateur
Create task¦Créer une tâche
Notify supervisor¦Notifier le superviseur
Escalate ticket¦Escalader le ticket
Request approval¦Demander une approbation
Strong partnerships. Connected operations.¦Des partenariats solides. Des opérations connectées.
Turn client goals into everyday progress.¦Transformez les objectifs clients en progrès quotidiens.
Every relationship, with the full story.¦Chaque relation, avec tout son historique.
A clearer view of every conversation.¦Une vue claire de chaque conversation.
Keep the right work moving forward.¦Faites avancer les activités prioritaires.
Make every next conversation count.¦Donnez du sens à chaque prochaine conversation.
From first response to a confident resolution.¦De la première réponse à une résolution efficace.
Thoughtful rules. More time for people.¦Des règles utiles. Plus de temps pour les personnes.
Great service starts with a supported team.¦Un service de qualité commence par une équipe accompagnée.
Coaching that makes a difference.¦Un accompagnement qui fait la différence.
The right message, in the right language.¦Le bon message, dans la bonne langue.
Shared knowledge for consistent support.¦Des connaissances partagées pour une assistance cohérente.
Edit record¦Modifier la fiche
Create record¦Créer une fiche
Changes are saved locally in this demo.¦Les modifications sont enregistrées localement dans cette démo.
This field is required¦Ce champ est obligatoire
Enter a valid email address¦Saisissez une adresse e-mail valide
Enter a number within the allowed range¦Saisissez un nombre dans la plage autorisée
End date must follow start date¦La date de fin doit suivre la date de début
A resolution is required to close this ticket¦Une résolution est requise pour clôturer ce ticket
Record an outcome before completing¦Consignez un résultat avant de terminer
Escalation requires a ticket trigger.¦L’escalade nécessite un déclencheur de ticket.
Choose another employee¦Choisissez un autre collaborateur
Select an option¦Sélectionnez une option
Only file names are stored. No files are uploaded.¦Seuls les noms des fichiers sont conservés. Aucun fichier n’est téléversé.
Cancel¦Annuler
Save changes¦Enregistrer
Close¦Fermer
Dismiss¦Masquer
Changes saved¦Modifications enregistrées
Record deleted¦Fiche supprimée
Note added¦Note ajoutée
Created¦Créé
Updated¦Mis à jour
Imported¦Importé
Work assigned¦Travail attribué
Status updated¦Statut mis à jour
Approval requested¦Approbation demandée
Automation applied¦Automatisation appliquée
Activate this rule before simulating.¦Activez cette règle avant de la simuler.
Condition not met. No records changed.¦Condition non remplie. Aucune fiche modifiée.
Select an active employee for this rule.¦Sélectionnez un collaborateur actif pour cette règle.
The employee does not speak the customer language.¦Le collaborateur ne parle pas la langue du client.
Simulation complete. Local records updated.¦Simulation terminée. Fiches locales mises à jour.
Local storage is full. Export your data before refreshing.¦Le stockage local est plein. Exportez les données avant d’actualiser.
This record has related activity. Reassign related records or deactivate it.¦Cette fiche contient des activités liées. Réattribuez-les ou désactivez la fiche.
Import complete¦Importation terminée
Demo data restored¦Données de démonstration restaurées
Import customers¦Importer des clients
Preview and validate a CSV before adding records.¦Prévisualisez et validez un CSV avant d’ajouter les fiches.
Required columns: name, email, phone, language. Language must be English or French.¦Colonnes requises : name, email, phone, language. La langue doit être English ou French.
Choose a campaign before importing¦Choisissez une campagne avant l’importation
CSV must include name, email, phone and language columns¦Le CSV doit contenir les colonnes name, email, phone et language
Some rows contain invalid or missing values¦Certaines lignes contiennent des valeurs manquantes ou invalides
Duplicate email found¦Adresse e-mail en double
No suitable agent found¦Aucun agent adapté trouvé
Invalid CSV¦CSV invalide
Download CSV example¦Télécharger un exemple CSV
Choose CSV file¦Choisir un fichier CSV
valid records ready¦fiches valides prêtes
Import records¦Importer les fiches
No records found¦Aucune fiche trouvée
Try changing your filters or add a new record.¦Modifiez les filtres ou ajoutez une fiche.
Search records...¦Rechercher des fiches...
All clients¦Tous les clients
All campaigns¦Toutes les campagnes
All teams¦Toutes les équipes
All languages¦Toutes les langues
All dates¦Toutes les dates
All statuses¦Tous les statuts
All employees¦Tous les collaborateurs
Today¦Aujourd’hui
Last 7 days¦7 derniers jours
Last 30 days¦30 derniers jours
Reset filters¦Réinitialiser les filtres
of¦sur
records¦fiches
Previous page¦Page précédente
Next page¦Page suivante
View record¦Voir la fiche
Export¦Exporter
Import¦Importer
Add¦Ajouter
Incoming simulation¦Simulation entrante
New call¦Nouvel appel
Total records¦Total des fiches
Active work¦Activités en cours
French proficient¦Maîtrise du français
List view¦Vue liste
Kanban view¦Vue Kanban
Calendar view¦Vue calendrier
All¦Tous
Upcoming¦À venir
Move task¦Déplacer la tâche
Previous month¦Mois précédent
Next month¦Mois suivant
Mon¦Lun
Tue¦Mar
Wed¦Mer
Thu¦Jeu
Fri¦Ven
Sat¦Sam
Sun¦Dim
Record not found¦Fiche introuvable
This record may have been deleted.¦Cette fiche a peut-être été supprimée.
Back to list¦Retour à la liste
Edit¦Modifier
Delete record¦Supprimer la fiche
Call customer¦Appeler le client
Create ticket¦Créer un ticket
Schedule follow-up¦Planifier un suivi
Mark complete¦Marquer comme terminé
Record outcome¦Consigner le résultat
Reschedule¦Replanifier
Resolve ticket¦Résoudre le ticket
Escalate¦Escalader
Reassign¦Réattribuer
Close ticket¦Clôturer le ticket
Deactivate¦Désactiver
Activate¦Activer
Approve¦Approuver
Pending approval¦Approbation en attente
Approved¦Approuvé
Activity history¦Historique d’activité
Related records¦Fiches liées
Record details¦Détails de la fiche
At a glance¦En bref
Service level¦Niveau de service
SLA¦SLA
Breached¦Dépassé
Met¦Respecté
Within SLA¦Dans le délai SLA
Open tasks¦Tâches ouvertes
Add internal note¦Ajouter une note interne
Internal note¦Note interne
Share context with your team...¦Partagez le contexte avec votre équipe...
Add note¦Ajouter une note
Delete record?¦Supprimer la fiche ?
This removes the local demonstration record. Related records must be reassigned first.¦La fiche locale sera supprimée. Les fiches liées doivent d’abord être réattribuées.
Delete¦Supprimer
Attachment preview¦Aperçu de la pièce jointe
Demonstration metadata only. File contents are not stored.¦Métadonnées de démonstration uniquement. Le contenu des fichiers n’est pas conservé.
Sample customer request document¦Exemple de document de demande client
Rule simulation¦Simulation de règle
WHEN¦QUAND
IF¦SI
THEN¦ALORS
Run this rule against one local record. Matching actions update the demo data.¦Appliquez cette règle à une fiche locale. Les actions correspondantes modifient les données de démo.
Simulation record¦Fiche de simulation
Simulate¦Simuler
Incoming call simulation¦Simulation d’appel entrant
Outgoing call simulation¦Simulation d’appel sortant
Simulation only. No telephone connection is made.¦Simulation uniquement. Aucun appel téléphonique réel.
Simulate incoming call¦Simuler un appel entrant
Start simulated call¦Démarrer l’appel simulé
Incoming call¦Appel entrant
Outgoing call¦Appel sortant
Call ended¦Appel terminé
On hold¦En attente
Connected¦Connecté
Answer¦Répondre
Decline¦Refuser
Missed call¦Appel manqué
Unmute¦Réactiver le micro
Mute¦Couper le micro
Resume¦Reprendre
Hold¦Mettre en attente
End call¦Terminer l’appel
Conversation notes¦Notes de conversation
Save call & finish¦Enregistrer et terminer
Add a disposition and conversation notes¦Ajoutez un motif de clôture et des notes
Demo recording¦Enregistrement de démonstration
Synthetic audio sample · 8 seconds · no customer audio¦Extrait audio synthétique · 8 secondes · aucune voix de client
INSIGHTS¦ANALYSES
A shared understanding of your performance.¦Une vision partagée de vos performances.
Agent productivity¦Productivité des agents
Team performance¦Performance des équipes
Campaign performance¦Performance des campagnes
Customer interactions¦Interactions clients
Ticket & SLA¦Tickets et SLA
Export CSV¦Exporter en CSV
In selected scope¦Dans le périmètre sélectionné
SLA breaches¦Dépassements SLA
Open and past due¦Ouverts et hors délai
SERVICE EXCELLENCE¦EXCELLENCE DU SERVICE
Turn every interaction into an opportunity to improve.¦Transformez chaque interaction en occasion de progresser.
Awaiting review¦En attente d’évaluation
Calls and tickets¦Appels et tickets
Completed scorecards¦Grilles d’évaluation terminées
Quality trends¦Tendances qualité
Evaluation history¦Historique des évaluations
Interaction¦Interaction
Evaluate¦Évaluer
Improvement notes¦Pistes d’amélioration
Evaluate interaction¦Évaluer l’interaction
Greeting & verification¦Accueil et vérification
Accuracy¦Exactitude
Empathy¦Empathie
Feedback and improvement notes are required¦Les commentaires et pistes d’amélioration sont obligatoires
Save evaluation¦Enregistrer l’évaluation
STAY IN THE LOOP¦RESTEZ INFORMÉ
The right update, at the right moment.¦La bonne information, au bon moment.
Mark all as read¦Tout marquer comme lu
All notifications¦Toutes les notifications
Unread¦Non lues
Templates¦Modèles
Mark unread¦Marquer non lu
Mark read¦Marquer lu
Dismiss notification¦Masquer la notification
New notifications will appear here.¦Les nouvelles notifications apparaîtront ici.
Email, SMS and WhatsApp previews. Nothing is sent.¦Aperçus e-mail, SMS et WhatsApp. Aucun envoi réel.
Add template¦Ajouter un modèle
Preview¦Aperçu
Notification preview¦Aperçu de notification
Simulation only. No message is sent.¦Simulation uniquement. Aucun message n’est envoyé.
Preview only¦Aperçu uniquement
BUILT FOR EVERY CONVERSATION¦CONÇU POUR CHAQUE CONVERSATION
One workspace. Two languages. Consistent service.¦Un espace. Deux langues. Un service cohérent.
Your workspace language¦La langue de votre espace
Navigation, forms, reports and notifications follow your preference.¦Navigation, formulaires, rapports et notifications suivent votre préférence.
Language-based assignment¦Attribution linguistique
Add article¦Ajouter un article
Read article¦Lire l’article
Match the language. Make the connection.¦La bonne langue pour le bon contact.
Only active employees proficient in the customer language are available.¦Seuls les collaborateurs actifs maîtrisant la langue du client sont disponibles.
Assign customer¦Attribuer le client
Language-based assignment saved¦Attribution linguistique enregistrée
Bilingual coverage¦Couverture bilingue
available employees¦collaborateurs disponibles
Covered¦Couvert
Explore reports by language¦Explorer les rapports par langue
MAKE IT YOURS¦PERSONNALISEZ VOTRE ESPACE
A workspace that fits the way your team works.¦Un espace adapté aux méthodes de votre équipe.
Custom fields¦Champs personnalisés
Stages & categories¦Étapes et catégories
Roles & permissions¦Rôles et autorisations
Demo data¦Données de démo
System preferences¦Préférences du système
Preferences are saved automatically on this device.¦Les préférences sont enregistrées automatiquement sur cet appareil.
Week starts on¦Premier jour de la semaine
Monday¦Lundi
Sunday¦Dimanche
Local timezone¦Fuseau horaire local
Dates use this browser’s local timezone.¦Les dates utilisent le fuseau horaire local du navigateur.
Follow-up reminders¦Rappels de suivi
Create local notifications for overdue follow-ups.¦Créer des notifications locales pour les suivis en retard.
Super Admin has full access to all demonstration features.¦Le Super Admin a accès à toutes les fonctionnalités de démonstration.
Added fields appear in record forms and detail pages.¦Les champs ajoutés apparaissent dans les formulaires et les fiches détaillées.
This value already exists¦Cette valeur existe déjà
Field name¦Nom du champ
Module¦Module
Required field¦Champ obligatoire
Add field¦Ajouter un champ
Required¦Obligatoire
Optional¦Facultatif
No custom fields yet¦Aucun champ personnalisé
Add a field to capture information your team needs.¦Ajoutez un champ pour recueillir les informations utiles à votre équipe.
Service categories¦Catégories de service
Priorities¦Priorités
Customer stages¦Étapes clients
Teams¦Équipes
New value¦Nouvelle valeur
This value is used by existing records¦Cette valeur est utilisée par des fiches existantes
Configure sample role permissions. This session always has Super Admin access.¦Configurez les autorisations de démonstration. Cette session conserve l’accès Super Admin.
View¦Consulter
Create¦Créer
Assign¦Attribuer
Configure¦Configurer
New role name¦Nom du nouveau rôle
Add role¦Ajouter un rôle
Enter a unique role name¦Saisissez un nom de rôle unique
All records are fictional and saved only in this browser. Export a backup or restore the original sample dataset.¦Toutes les fiches sont fictives et conservées dans ce navigateur. Exportez une sauvegarde ou restaurez les données initiales.
Export local backup¦Exporter une sauvegarde locale
Reset demo data¦Réinitialiser la démo
Reset demo data?¦Réinitialiser les données ?
All local changes will be replaced by the original sample data.¦Toutes les modifications locales seront remplacées par les données initiales.
Delete configuration?¦Supprimer la configuration ?
This removes the selected configuration from the local demo.¦La configuration sélectionnée sera supprimée de la démo locale.
Page not found¦Page introuvable
Back to overview¦Retour à la vue d’ensemble
Follow-up reminder¦Rappel de suivi
Ticket escalated¦Ticket escaladé
Task assigned¦Tâche attribuée
Automation follow-up¦Suivi automatisé
French support routing¦Routage de l’assistance française
Priority escalation¦Escalade prioritaire
Approval before closure¦Approbation avant clôture
Service quality review¦Évaluation de la qualité du service
Welcome email¦E-mail de bienvenue
Resolution update¦Mise à jour de résolution
Account verification¦Vérification du compte
Escalation guide¦Guide d’escalade
Review onboarding documents¦Vérifier les documents d’intégration
Prepare weekly service review¦Préparer la revue hebdomadaire
Confirm address update¦Confirmer la mise à jour d’adresse
Investigate duplicate invoice¦Examiner la facture en double
Validate account information¦Valider les informations du compte
Review campaign handover¦Examiner la passation de campagne
Update customer preferences¦Mettre à jour les préférences client
Prepare retention offer¦Préparer l’offre de fidélisation
Reconcile open requests¦Rapprocher les demandes ouvertes
Review support knowledge article¦Vérifier l’article d’assistance
Unable to access account¦Accès au compte impossible
Invoice amount clarification¦Précision sur le montant facturé
Delivery status enquiry¦Demande de suivi de livraison
Update contact information¦Mettre à jour les coordonnées
Refund request review¦Examen d’une demande de remboursement
Service activation delay¦Retard d’activation du service
Subscription plan change¦Changement d’abonnement
Payment confirmation missing¦Confirmation de paiement manquante
Account assistance¦Assistance sur le compte
Billing enquiry¦Question de facturation
Welcome conversation¦Conversation de bienvenue
Service follow-up¦Suivi du service
Confirm resolution¦Confirmer la résolution
Review requested documents¦Vérifier les documents demandés
Share account update¦Partager une mise à jour du compte
Discuss service options¦Discuter des options de service
Telecommunications¦Télécommunications
Retail¦Commerce de détail
Healthcare¦Santé
Financial services¦Services financiers
Travel¦Voyage
E-commerce¦Commerce en ligne
Customer care · EN¦Service client · EN
Concierge support · FR¦Conciergerie · FR
Patient assistance¦Assistance aux patients
Account onboarding¦Ouverture de compte
Travel helpdesk¦Assistance voyage
Order experience¦Suivi des commandes
CLIENT¦CLIENT
CAMPAIGN¦CAMPAGNE
CUSTOMER¦CLIENT FINAL
CALL¦APPEL
TASK¦TÂCHE
FOLLOW-UP¦SUIVI
TICKET¦TICKET
AUTOMATION RULE¦RÈGLE D’AUTOMATISATION
EMPLOYEE¦COLLABORATEUR
EVALUATION¦ÉVALUATION
TEMPLATE¦MODÈLE
ARTICLE¦ARTICLE
`;
const fr: Record<string, string> = Object.fromEntries(
  pairs
    .trim()
    .split("\n")
    .map((l) => {
      const p = l.indexOf("¦");
      return [l.slice(0, p), l.slice(p + 1)];
    }),
);
let language = "en";
try {
  language = localStorage.getItem("meridian.language") || "en";
} catch {}
i18n.use(initReactI18next).init({
  resources: {
    en: { translation: { locale: "en-GB" } },
    fr: { translation: fr },
  },
  lng: language,
  supportedLngs: ["en", "fr"],
  fallbackLng: "en",
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
  returnNull: false,
});
i18n.on("languageChanged", (lng) => {
  document.documentElement.lang = lng;
  try {
    localStorage.setItem("meridian.language", lng);
  } catch {}
});
document.documentElement.lang = language;
export default i18n;
