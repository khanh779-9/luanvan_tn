<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TopicRegistrationForm extends Model
{
    protected $table = 'topic_registrations_form';
    public $timestamps = false;

    const UPDATED_AT = 'updated_at';

    protected $fillable = [
        'topic_title',
        'topic_description',
        'topic_type',
        'student1_id',
        'student1_name',
        'student1_class',
        'student1_email',
        'student2_id',
        'student2_name',
        'student2_class',
        'student2_email',
        'gvhd_code',
        'gvhd_workplace',
        'gvpb_code',
        'note',
        'source',
        'status',
        'registered_at',
        'updated_at',
    ];

    public function gvhd()
    {
        return $this->belongsTo(GiangVien::class, 'gvhd_code', 'maGV');
    }
}
